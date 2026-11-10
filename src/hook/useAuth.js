
"use client";

import { useState, useEffect, useCallback } from 'react';

export default function useAuth() {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    // Vérifier si un utilisateur possède une session valide
    const verifierConnexion = useCallback(async () => {
        setLoading(true);
        setError('');

        try {
            const response = await fetch('/api/auth/me', {
                method: 'GET',
                cache: 'no-store',
            });

            const data = await response.json();

            if (!response.ok) {
                setUser(null);

                if (response.status !== 401) {
                    setError(data.message || 'Impossible de vérifier la session.');
                }

                return null;
            }

            setUser(data.user);
            return data.user;

        } catch (error) {
            setUser(null);
            setError('Impossible de contacter le serveur.');
            return null;

        } finally {
            setLoading(false);
        }
    }, []);

    // Vérification au chargement du composant
    useEffect(() => {
        verifierConnexion();
    }, [verifierConnexion]);

    // Déconnecter l'utilisateur
    async function deconnecter() {
        try {
            const response = await fetch('/api/auth/logout', {
                method: 'POST',
            });

            if (!response.ok) {
                throw new Error('La déconnexion a échoué.');
            }

            setUser(null);
            setError('');

        } catch (error) {
            setError(error.message);
        }
    }

    return {
        user,
        loading,
        error,
        isAuthenticated: !!user,
        verifierConnexion,
        deconnecter,
    };
}
