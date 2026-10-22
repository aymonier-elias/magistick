import { useState } from "react";

export default function Input({ label, name, type = "text", required = false }) {
    let [visible, setVisible] = useState(true);

    if (type === "password") {
        return (
            <>
                <label className="champ">
                    {label}
                    <span className="champ-mdp">
                        <input type={visible ? type : "text"} name={name} autoComplete="current-password" required={required} />
                        <button className="afficher" onClick={() => setVisible((current) => !current)}>Afficher</button>
                    </span>
                </label>
                <div className="mdp-oublie">
                    <a href="#">Mot de passe oublié ?</a>
                </div>
            </>
        );
    }
    if (type === "submit") {
        return (
            <button type="submit" className="btn-principal">{label}</button>
        );
    }

    return (
        <label className="champ">
            {label}
            <input type={type} name={name} autoComplete={name} required={required} />
        </label>
    );

}

