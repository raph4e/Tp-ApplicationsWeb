/* Récupère le package knex */
const knex = require('knex')

/* Créer une instance de base de données */
const db = knex({
    client: 'sqlite3',
    /* Indique le nom du fichier dont on souhaite connecter la base de données */
    connection: { 
        filename: "/Users/raphaellemieux/Tp-ApplicationsWeb/Tp-ApplicationsWeb-1/serveur/db.sqlite3"       
    },
    /* Utiliser la valeur null comme valeur par défaut */
    useNullAsDefault: true
});

/* Fonction qui vérifie si la table clients existe, et la créé si ce n'est pas le cas */
async function createTable() {
    const exist = await db.schema.hasTable("clients");
    const pretsExist = await db.schema.hasTable("prets")
    /* Si la table n'existe pas, on la crée */
    if (!exist) {
        await db.schema.createTable("clients", (table) => {
            table.increments("id").primary();
            table.string("nom").notNullable();
            table.string("prenom").notNullable();
            table.string("email").notNullable();
            table.integer("numeroDeTelephone").notNullable();
            table.string("adresse").notNullable();
            table.integer("nombreDePrets").defaultTo(0);
            table.integer("montantDu").defaultTo(0);
            table.timestamp("create_at").defaultTo(db.fn.now());
        });
        console.log("Table 'clients' créée !");
    }
    if (!pretsExist) {
        await db.schema.createTable("prets", (table)=> {
            table.uuid("idPret").primary()
            table.integer("idClient").notNullable()
            table.foreign("idClient").references("clients.id")
            table.decimal("montant", 6, 2).notNullable()
            table.decimal("interet", 6, 2).notNullable()
            table.integer("duree").notNullable()
            table.date("dateDebut").notNullable()
        })
        console.log("Table 'prets' créée!")
    }
}


/* Exporte l'objet db et la fonction createTable */
module.exports = {
    db,
    createTable
};
