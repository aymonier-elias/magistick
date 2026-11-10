
import { NextResponse } from 'next/server';
import { randomUUID } from 'node:crypto';

const getWordPressUrl = () =>
    (process.env.WP_URL || process.env.WC_URL || '').replace(/\/+$/, '');

export async function POST(request) {
    try {
        const { prenom, nom, email, mdp } = await request.json();

        // Vérification des champs
        if (!prenom?.trim() || !nom?.trim() || !email?.trim() || !mdp) {
            return NextResponse.json(
                { message: 'Tous les champs sont obligatoires.' },
                { status: 400 }
            );
        }

        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            return NextResponse.json(
                { message: 'Adresse email invalide.' },
                { status: 400 }
            );
        }

        if (mdp.length < 8) {
            return NextResponse.json(
                { message: 'Le mot de passe doit contenir au moins 8 caractères.' },
                { status: 400 }
            );
        }

        const url = getWordPressUrl();
        const key = process.env.WC_CONSUMER_KEY;
        const secret = process.env.WC_CONSUMER_SECRET;

        if (!url || !key || !secret) {
            throw new Error('Configuration WooCommerce incomplète.');
        }

        if (new URL(url).protocol !== 'https:') {
            throw new Error('WordPress doit être accessible en HTTPS.');
        }

        // Création d'un identifiant WordPress unique
        const identifiant =
            email.split('@')[0]
                .toLowerCase()
                .replace(/[^a-z0-9_-]/g, '-') +
            '-' + randomUUID().slice(0, 8);

        // Authentification de notre serveur auprès de WooCommerce
        const authorization = Buffer.from(`${key}:${secret}`).toString('base64');

        // Création du client WooCommerce
        const creation = await fetch(`${url}/wp-json/wc/v3/customers`, {
            method: 'POST',
            headers: {
                'Authorization': `Basic ${authorization}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                email: email.trim().toLowerCase(),
                first_name: prenom.trim(),
                last_name: nom.trim(),
                username: identifiant,
                password: mdp,
                role: 'customer',
            }),
            cache: 'no-store',
        });

        const client = await creation.json();

        if (!creation.ok) {
            if (client.code === 'registration-error-email-exists' ||
                client.code === 'woocommerce_rest_customer_invalid_email') {
                return NextResponse.json(
                    { message: 'Cette adresse email possède déjà un compte.' },
                    { status: 409 }
                );
            }

            return NextResponse.json(
                { message: client.message || 'Impossible de créer le compte.' },
                { status: creation.status }
            );
        }

        // Connexion automatique après inscription
        const connexion = await fetch(
            `${url}/wp-json/jwt-auth/v1/token`,
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    username: email.trim().toLowerCase(),
                    password: mdp,
                }),
                cache: 'no-store',
            }
        );

        const tokenData = await connexion.json();

        // Le compte est créé, même si la connexion automatique échoue
        if (!connexion.ok || !tokenData.token) {
            return NextResponse.json(
                {
                    message: 'Compte créé ! Vous pouvez maintenant vous connecter.',
                    user: {
                        id: client.id,
                        email: client.email,
                        first_name: client.first_name,
                        last_name: client.last_name,
                    },
                },
                { status: 201 }
            );
        }

        const response = NextResponse.json({
            message: 'Compte créé et connexion réussie !',
            user: {
                id: client.id,
                email: client.email,
                first_name: client.first_name,
                last_name: client.last_name,
            },
        });

        response.cookies.set('auth_token', tokenData.token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            path: '/',
            maxAge: 60 * 60 * 24 * 7,
        });

        return response;

    } catch (error) {
        console.error('Erreur inscription :', error);

        return NextResponse.json(
            { message: 'Une erreur est survenue lors de l’inscription.' },
            { status: 500 }
        );
    }
}
