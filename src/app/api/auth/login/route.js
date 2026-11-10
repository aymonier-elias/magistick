
import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const { email, mdp } = await request.json();

    // Vérification des champs
    if (!email || !mdp) {
      return NextResponse.json(
        { message: 'Identifiants manquants.' },
        { status: 400 }
      );
    }

    // Demande de connexion à WordPress
    const wpUrl = (process.env.WP_URL || process.env.WC_URL || '')
      .replace(/\/+$/, '');

    if (!wpUrl) {
      throw new Error('WP_URL et WC_URL ne sont pas configurés.');
    }

    const response = await fetch(
      `${wpUrl}/wp-json/jwt-auth/v1/token`,
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


    const data = await response.json();

    // Identifiants incorrects ou erreur WordPress
    if (!response.ok) {
      return NextResponse.json(
        { message: data.message || 'Connexion impossible.' },
        { status: 401 }
      );
    }

    // Création de la réponse
    const res = NextResponse.json({
      message: 'Connexion réussie.',
      user: data.user,
    });

    // Stockage sécurisé du token
    res.cookies.set('auth_token', data.token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7,
    });

    return res;

  } catch (error) {
    console.error('Erreur de connexion :', error);

    return NextResponse.json(
      { message: 'Erreur interne du serveur.' },
      { status: 500 }
    );
  }
}