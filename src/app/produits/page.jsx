"use client";

import { useEffect, useState } from "react";

import '../../css/produits/produits.css';

import Header from "../../components/global/Header";
import ProduitCatalogue from "../../components/global/ProduitCatalogue";

const catalogue = [
  {
    "id": 12,
    "name": "Bravo Enculer",
    "slug": "bravo-enculer",
    "permalink": "https://ip87-106-3-165.pbiaas.com/product/bravo-enculer/",
    "date_created": "2026-10-07T15:00:10",
    "date_created_gmt": "2026-10-07T15:00:10",
    "date_modified": "2026-10-07T15:00:10",
    "date_modified_gmt": "2026-10-07T15:00:10",
    "type": "simple",
    "status": "publish",
    "featured": false,
    "catalog_visibility": "visible",
    "description": "",
    "short_description": "",
    "sku": "",
    "price": "",
    "regular_price": "",
    "sale_price": "",
    "date_on_sale_from": null,
    "date_on_sale_from_gmt": null,
    "date_on_sale_to": null,
    "date_on_sale_to_gmt": null,
    "on_sale": false,
    "purchasable": false,
    "total_sales": 0,
    "virtual": false,
    "downloadable": false,
    "downloads": [],
    "download_limit": -1,
    "download_expiry": -1,
    "external_url": "",
    "button_text": "",
    "tax_status": "taxable",
    "tax_class": "",
    "manage_stock": false,
    "stock_quantity": null,
    "backorders": "no",
    "backorders_allowed": false,
    "backordered": false,
    "low_stock_amount": null,
    "sold_individually": false,
    "weight": "",
    "dimensions": {
      "length": "",
      "width": "",
      "height": ""
    },
    "shipping_required": true,
    "shipping_taxable": true,
    "shipping_class": "",
    "shipping_class_id": 0,
    "reviews_allowed": true,
    "average_rating": "0.00",
    "rating_count": 0,
    "upsell_ids": [],
    "cross_sell_ids": [],
    "parent_id": 0,
    "purchase_note": "",
    "categories": [
      {
        "id": 15,
        "name": "Uncategorized",
        "slug": "uncategorized"
      }
    ],
    "brands": [],
    "tags": [],
    "images": [],
    "attributes": [],
    "default_attributes": [],
    "variations": [],
    "grouped_products": [],
    "menu_order": 0,
    "price_html": "",
    "related_ids": [
      11
    ],
    "meta_data": [],
    "stock_status": "instock",
    "has_options": false,
    "post_password": "",
    "global_unique_id": "",
    "_links": {
      "self": [
        {
          "href": "https://ip87-106-3-165.pbiaas.com/wp-json/wc/v3/products/12",
          "targetHints": {
            "allow": [
              "GET",
              "POST",
              "PUT",
              "PATCH",
              "DELETE"
            ]
          }
        }
      ],
      "collection": [
        {
          "href": "https://ip87-106-3-165.pbiaas.com/wp-json/wc/v3/products"
        }
      ]
    }
  },
  {
    "id": 11,
    "name": "testioezgfiuhovjzpyiguz",
    "slug": "testioezgfiuhovjzpyiguz",
    "permalink": "https://ip87-106-3-165.pbiaas.com/product/testioezgfiuhovjzpyiguz/",
    "date_created": "2026-10-07T12:53:00",
    "date_created_gmt": "2026-10-07T12:53:00",
    "date_modified": "2026-10-07T12:53:15",
    "date_modified_gmt": "2026-10-07T12:53:15",
    "type": "simple",
    "status": "publish",
    "featured": false,
    "catalog_visibility": "visible",
    "description": "<p>^fogui</p>\n",
    "short_description": "",
    "sku": "",
    "price": "",
    "regular_price": "",
    "sale_price": "",
    "date_on_sale_from": null,
    "date_on_sale_from_gmt": null,
    "date_on_sale_to": null,
    "date_on_sale_to_gmt": null,
    "on_sale": false,
    "purchasable": false,
    "total_sales": 0,
    "virtual": false,
    "downloadable": false,
    "downloads": [],
    "download_limit": -1,
    "download_expiry": -1,
    "external_url": "",
    "button_text": "",
    "tax_status": "taxable",
    "tax_class": "",
    "manage_stock": false,
    "stock_quantity": null,
    "backorders": "no",
    "backorders_allowed": false,
    "backordered": false,
    "low_stock_amount": null,
    "sold_individually": false,
    "weight": "",
    "dimensions": {
      "length": "",
      "width": "",
      "height": ""
    },
    "shipping_required": true,
    "shipping_taxable": true,
    "shipping_class": "",
    "shipping_class_id": 0,
    "reviews_allowed": true,
    "average_rating": "0.00",
    "rating_count": 0,
    "upsell_ids": [],
    "cross_sell_ids": [],
    "parent_id": 0,
    "purchase_note": "",
    "categories": [
      {
        "id": 15,
        "name": "Uncategorized",
        "slug": "uncategorized"
      }
    ],
    "brands": [],
    "tags": [],
    "images": [],
    "attributes": [],
    "default_attributes": [],
    "variations": [],
    "grouped_products": [],
    "menu_order": 0,
    "price_html": "",
    "related_ids": [
      12
    ],
    "meta_data": [],
    "stock_status": "instock",
    "has_options": false,
    "post_password": "",
    "global_unique_id": "",
    "_links": {
      "self": [
        {
          "href": "https://ip87-106-3-165.pbiaas.com/wp-json/wc/v3/products/11",
          "targetHints": {
            "allow": [
              "GET",
              "POST",
              "PUT",
              "PATCH",
              "DELETE"
            ]
          }
        }
      ],
      "collection": [
        {
          "href": "https://ip87-106-3-165.pbiaas.com/wp-json/wc/v3/products"
        }
      ]
    }
  }
]

export default function Produits(){
    const [recherche, setRecherche] = useState("");
    const [results, setResults] = useState(catalogue);
    // const [erreur, setErreur] = useState("");

    const handleRecherche = (e) => {
        e.preventDefault();
    }

    useEffect(() => {

        // Timeout pour éviter le spam d'api
        const timeoutRecherche = setTimeout(async() => {
            // Affiche tout les produits si aucune recherche n'est effectué
            if (recherche.trim() === '') {
              setResults(catalogue);
              return;
            }

            // try{
            //     const response = await fetch(catalogue);
            //     const data = await response.json();
            //     setResults(data);
            // }
            // catch (error){
            //     setErreur(`Une erreur est survenue : ${error}`)
            // }

        }, 1000)

        return () => clearTimeout(timeoutRecherche);
    }, [recherche]);

    return(
        <div>
            <Header />

            <div>
                <h1>Le catalogue des baguettes</h1>
            </div>
            
            <form onSubmit={handleRecherche}>

                {/* Barre de recherche */}
                <label>Tout les produits
                    <input className="barreRecherche" type="search" value={recherche} onChange={(e) => {setRecherche(e.target.value)}} />
                </label>

                {/* Affiche la recherche en dessous de la barre de recherche */}
                <div>{recherche ? (<p>Recherche : {recherche}</p>) : ("")}</div>

                {/* Bloc filtres + produits */}
                <div className="filtres-catalogue">

                    {/* Bloc filtres */}
                    <div className="filtres">
                        <p>filtres</p>
                    </div>

                    {/* Bloc produits */}
                    <div id="resultatCatalogue">
                        {console.log(results)}
                        {results.length > 0 ? (
                            results.map(item => (
                                <ProduitCatalogue id={item.id} name={item.name} key={`${item.id}-${item.name}`} />
                            ))
                            ) : (
                            <p>Aucun résultat</p>
                        )}
                        {/* {erreur ? (<p>{erreur}</p>) : ("")} */}
                    </div>
                </div>
            </form>

        </div>
    );
}