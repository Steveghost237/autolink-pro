"""Intégrations LIVE des prestataires de paiement — Stripe Checkout & PayPal Orders.

Les clés viennent des variables d'environnement (jamais en dur) :
  STRIPE_API_KEY, STRIPE_WEBHOOK_SECRET, PAYPAL_CLIENT_ID, PAYPAL_CLIENT_SECRET,
  PAYPAL_MODE ('live'|'sandbox'), FRONTEND_URL, FCFA_PER_USD.

Stripe : XAF est une devise zéro-décimale supportée nativement.
PayPal : XAF non supporté → conversion USD via FCFA_PER_USD.
"""
import base64
import hashlib
import hmac
import json
import time
import urllib.parse
import urllib.request
import uuid
from decimal import Decimal

from django.conf import settings
import requests


class ProviderError(Exception):
    """Erreur remontée par le prestataire (clé invalide, réseau, capture refusée…)."""


def _post(url, data, headers=None, timeout=30):
    body = urllib.parse.urlencode(data).encode() if isinstance(data, dict) else data
    req = urllib.request.Request(url, data=body, headers=headers or {})
    try:
        with urllib.request.urlopen(req, timeout=timeout) as r:
            raw = r.read().decode()
            return json.loads(raw) if raw else {}
    except urllib.error.HTTPError as e:
        detail = e.read().decode()[:400]
        raise ProviderError(f'{url} -> HTTP {e.code}: {detail}')
    except Exception as e:
        raise ProviderError(f'{url} -> {e}')


def _get(url, headers=None, timeout=20):
    req = urllib.request.Request(url, headers=headers or {})
    try:
        with urllib.request.urlopen(req, timeout=timeout) as r:
            return json.loads(r.read().decode())
    except urllib.error.HTTPError as e:
        detail = e.read().decode()[:400]
        raise ProviderError(f'{url} -> HTTP {e.code}: {detail}')
    except Exception as e:
        raise ProviderError(f'{url} -> {e}')


# ─── STRIPE ───────────────────────────────────────────────────────────────────

STRIPE_API = 'https://api.stripe.com/v1'


def _stripe_headers():
    key = getattr(settings, 'STRIPE_API_KEY', '')
    if not key:
        raise ProviderError('STRIPE_API_KEY non configurée.')
    return {'Authorization': f'Bearer {key}'}


def stripe_create_checkout(amount_fcfa, ref, label, success_url, cancel_url, email=''):
    """Crée une session Stripe Checkout (page de paiement hébergée).
    Retourne {'id': 'cs_…', 'url': 'https://checkout.stripe.com/…'}."""
    params = {
        'mode': 'payment',
        'payment_method_types[]': 'card',
        'line_items[0][price_data][currency]': 'xaf',      # FCFA, zéro décimale
        'line_items[0][price_data][unit_amount]': int(amount_fcfa),
        'line_items[0][price_data][product_data][name]': label,
        'line_items[0][quantity]': 1,
        'success_url': success_url + ('&' if '?' in success_url else '?') + 'session_id={CHECKOUT_SESSION_ID}',
        'cancel_url': cancel_url,
        'metadata[autolink_ref]': ref,
    }
    if email:
        params['customer_email'] = email
    return _post(f'{STRIPE_API}/checkout/sessions', params, _stripe_headers())


def stripe_get_session(session_id):
    """Lit une session Checkout (vérification serveur du paiement)."""
    return _get(f'{STRIPE_API}/checkout/sessions/{session_id}', _stripe_headers())


def stripe_verify_webhook(payload_bytes, sig_header, secret):
    """Vérifie la signature Stripe-Signature (HMAC-SHA256).
    Retourne l'événement dict ou lève ProviderError."""
    try:
        parts = dict(kv.split('=', 1) for kv in sig_header.split(','))
        ts, sig = parts['t'], parts['v1']
    except Exception:
        raise ProviderError('Signature webhook malformée.')
    expected = hmac.new(secret.encode(), f'{ts}.'.encode() + payload_bytes, hashlib.sha256).hexdigest()
    if not hmac.compare_digest(expected, sig):
        raise ProviderError('Signature webhook invalide.')
    if abs(time.time() - int(ts)) > 300:
        raise ProviderError('Webhook trop ancien (replay).')
    return json.loads(payload_bytes.decode())


# ─── PAYPAL ───────────────────────────────────────────────────────────────────

def _paypal_base():
    return 'https://api-m.paypal.com' if getattr(settings, 'PAYPAL_MODE', 'sandbox') == 'live' \
        else 'https://api-m.sandbox.paypal.com'


def _paypal_token():
    cid = getattr(settings, 'PAYPAL_CLIENT_ID', '')
    sec = getattr(settings, 'PAYPAL_CLIENT_SECRET', '')
    if not cid or not sec:
        raise ProviderError('Identifiants PayPal non configurés.')
    auth = base64.b64encode(f'{cid}:{sec}'.encode()).decode()
    r = _post(f'{_paypal_base()}/v1/oauth2/token',
              {'grant_type': 'client_credentials'},
              {'Authorization': f'Basic {auth}', 'Content-Type': 'application/x-www-form-urlencoded'})
    token = r.get('access_token')
    if not token:
        raise ProviderError('Token PayPal introuvable dans la réponse.')
    return token


def paypal_create_order(amount_fcfa, ref, label, return_url, cancel_url):
    """Crée une commande PayPal (redirection vers la page d'approbation).
    Retourne {'id': 'ORDER_ID', 'approval_url': 'https://www.paypal.com/…'}."""
    rate = Decimal(str(getattr(settings, 'FCFA_PER_USD', 600)))
    usd = (Decimal(amount_fcfa) / rate).quantize(Decimal('0.01'))
    body = json.dumps({
        'intent': 'CAPTURE',
        'purchase_units': [{
            'reference_id': ref,
            'description': label,
            'custom_id': ref,
            'amount': {'currency_code': 'USD', 'value': str(usd)},
        }],
        'application_context': {
            'brand_name': 'AutoLink Pro',
            'return_url': return_url,
            'cancel_url': cancel_url,
            'user_action': 'PAY_NOW',
        },
    }).encode()
    r = _post(f'{_paypal_base()}/v2/checkout/orders', body, {
        'Authorization': f'Bearer {_paypal_token()}',
        'Content-Type': 'application/json',
        'Prefer': 'return=representation',
    })
    approval = next((l['href'] for l in r.get('links', []) if l.get('rel') == 'approve'), None)
    if not approval:
        raise ProviderError('Lien d\'approbation PayPal absent de la réponse.')
    return {'id': r.get('id'), 'approval_url': approval}


def paypal_capture_order(order_id):
    """Capture une commande approuvée par l'acheteur. Retourne le statut."""
    return _post(f'{_paypal_base()}/v2/checkout/orders/{order_id}/capture', b'{}', {
        'Authorization': f'Bearer {_paypal_token()}',
        'Content-Type': 'application/json',
    })


def _request(method, url, **kwargs):
    try:
        response = requests.request(method, url, timeout=30, **kwargs)
        response.raise_for_status()
        return response.json() if response.content else {}
    except requests.RequestException as error:
        raise ProviderError(f'Prestataire indisponible: {error}') from error


def mtn_configured():
    return all(getattr(settings, name, '') for name in (
        'MTN_MOMO_SUBSCRIPTION_KEY', 'MTN_MOMO_API_USER', 'MTN_MOMO_API_KEY'))


def _mtn_token():
    if not mtn_configured():
        raise ProviderError('Configuration MTN MoMo incomplète.')
    base = settings.MTN_MOMO_BASE_URL.rstrip('/')
    data = _request(
        'post', f'{base}/collection/token/',
        auth=(settings.MTN_MOMO_API_USER, settings.MTN_MOMO_API_KEY),
        headers={'Ocp-Apim-Subscription-Key': settings.MTN_MOMO_SUBSCRIPTION_KEY},
    )
    if not data.get('access_token'):
        raise ProviderError('Le token MTN MoMo est absent.')
    return data['access_token']


def mtn_request_to_pay(amount, phone, external_id, payer_message='Paiement AutoLink',
                       payee_note='Paiement AutoLink'):
    token = _mtn_token()
    reference = str(uuid.uuid4())
    base = settings.MTN_MOMO_BASE_URL.rstrip('/')
    _request(
        'post', f'{base}/collection/v1_0/requesttopay',
        json={
            'amount': str(amount),
            'currency': settings.MTN_MOMO_CURRENCY,
            'externalId': external_id,
            'payer': {'partyIdType': 'MSISDN', 'partyId': phone},
            'payerMessage': payer_message,
            'payeeNote': payee_note,
        },
        headers={
            'Authorization': f'Bearer {token}',
            'X-Reference-Id': reference,
            'X-Target-Environment': settings.MTN_MOMO_TARGET_ENV,
            'Ocp-Apim-Subscription-Key': settings.MTN_MOMO_SUBSCRIPTION_KEY,
            'Content-Type': 'application/json',
        },
    )
    return {'provider_ref': reference, 'status': 'PENDING'}


def mtn_status(reference):
    token = _mtn_token()
    return _request(
        'get',
        f'{settings.MTN_MOMO_BASE_URL.rstrip("/")}/collection/v1_0/requesttopay/{reference}',
        headers={
            'Authorization': f'Bearer {token}',
            'X-Target-Environment': settings.MTN_MOMO_TARGET_ENV,
            'Ocp-Apim-Subscription-Key': settings.MTN_MOMO_SUBSCRIPTION_KEY,
        },
    )


def orange_configured():
    return all(getattr(settings, name, '') for name in (
        'ORANGE_CLIENT_ID', 'ORANGE_CLIENT_SECRET', 'ORANGE_MERCHANT_KEY'))


def _orange_token():
    if not orange_configured():
        raise ProviderError('Configuration Orange Money incomplète.')
    data = _request(
        'post', 'https://api.orange.com/oauth/v3/token',
        auth=(settings.ORANGE_CLIENT_ID, settings.ORANGE_CLIENT_SECRET),
        data={'grant_type': 'client_credentials'},
    )
    if not data.get('access_token'):
        raise ProviderError('Le token Orange Money est absent.')
    return data['access_token']


def orange_create_payment(amount, order_id, reference, return_url, cancel_url, notif_url):
    data = _request(
        'post', f'{settings.ORANGE_OM_BASE_URL.rstrip("/")}/webpayment',
        headers={'Authorization': f'Bearer {_orange_token()}', 'Content-Type': 'application/json'},
        json={
            'merchant_key': settings.ORANGE_MERCHANT_KEY,
            'currency': settings.ORANGE_OM_CURRENCY,
            'order_id': order_id,
            'amount': int(amount),
            'return_url': return_url,
            'cancel_url': cancel_url,
            'notif_url': notif_url,
            'lang': 'fr',
            'reference': reference,
        },
    )
    if not data.get('payment_url') or not data.get('pay_token') or not data.get('notif_token'):
        raise ProviderError('Réponse Orange Money incomplète.')
    return data


def orange_status(order_id, amount, pay_token):
    return _request(
        'post', f'{settings.ORANGE_OM_BASE_URL.rstrip("/")}/transactionstatus',
        headers={'Authorization': f'Bearer {_orange_token()}', 'Content-Type': 'application/json'},
        json={'order_id': order_id, 'amount': int(amount), 'pay_token': pay_token},
    )
