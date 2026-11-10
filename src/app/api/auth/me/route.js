
import { NextResponse } from 'next/server';

export async function GET(request) {
    try {
        const token = request.cookies.get('auth_token')?.value;

        if (!token) {
            return NextResponse.json(
                { message: 'Utilisateur non connecté.' },
                { status: 401 }
            );
        }

        const url = (process.env.WP_URL || process.env.WC_URL || '')
            .replace(/\/+$/, '');

        if (!url) {
            throw new Error('URL WordPress manquante.');
        }

        const response = await fetch(
            `${url}/wp-json/wp/v2/users/me?context=edit`,
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
                cache: 'no-store',
            }
        );

        const data = await response.json();

        if (!response.ok) {
            const res = NextResponse.json(
                { message: 'Session expirée ou invalide.' },
                { status: 401 }
            );

            res.cookies.set('auth_token', '', {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'lax',
                path: '/',
                maxAge: 0,
            });

            return res;
        }

        // Récupération du prénom et du nom
        const firstName = data.first_name || '';
        const lastName = data.last_name || '';

        // Construction du nom complet
        const fullName = `${firstName} ${lastName}`.trim();

        return NextResponse.json({
            user: {
                id: data.id,
                email: data.email,
                name: fullName || data.name,
                username: data.slug,
                first_name: firstName,
                last_name: lastName,
            },
        });

    } catch (error) {
        console.error('Erreur récupération utilisateur :', error);

        return NextResponse.json(
            { message: 'Impossible de récupérer le profil.' },
            { status: 500 }
        );
    }
}
