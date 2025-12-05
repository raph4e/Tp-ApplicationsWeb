/* Récupère le package knex */
const knex = require('knex')

/* Créer une instance de base de données */
const db = knex({
    client: 'sqlite3',
    /* Indique le nom du fichier (CHEMIN RELATIF) dont on souhaite connecter la base de données */
    connection: { 
        filename: "./db.sqlite3"       
    },
    /* Utiliser la valeur null comme valeur par défaut */
    useNullAsDefault: true
});

/* Fonction qui vérifie si la table clients existe, et la créé si ce n'est pas le cas */
async function createTable() {
    const exist = await db.schema.hasTable("clients");
    const pretsExist = await db.schema.hasTable("prets")
    const paiementsExist = await db.schema.hasTable("paiements")
    const adminExist = await db.schema.hasTable("admin")
    const adminConnecteExist = await db.schema.hasTable("adminConnecte")
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
            table.increments("idPret").primary()
            table.integer("idClient").notNullable()
            table.foreign("idClient").references("clients.id")
            table.decimal("montantInitial", 6, 2).notNullable()
            table.decimal("montant", 6, 2).notNullable()
            table.decimal("interet", 6, 2).notNullable()
            table.integer("duree").notNullable()
            table.date("dateDebut").notNullable()
            table.string("statut")
        })
        console.log("Table 'prets' créée!")
    }
    if (!paiementsExist) {
        await db.schema.createTable("paiements", (table) => {
            table.increments("idPaiement").primary();
            table.integer("idPret").notNullable()
            table.foreign("idPret").references("prets.id")
            table.integer("montantPaye").notNullable()
            table.date("datePaiement").notNullable()
            table.string("modePaiement").notNullable()
            table.string("notePaiement").notNullable()          
        })
        console.log("Table 'paiements' créée! ")
    }
    if (!adminExist) {
        await db.schema.createTable("admin", (table) => {
            table.increments("idAdmin").primary(),
            table.string("nomAdmin").notNullable(),
            table.string("motDePasseAdmin").notNullable()
        })
        console.log("Table 'admin' créée! ")
    }
    if (!adminConnecteExist) {
        await db.schema.createTable("adminConnecte", (table) => {
            table.string("idAdminConnecte").notNullable(),
            table.string("nomAdminConnecte").notNullable(),
            table.string("motDePasseAdmin").notNullable()
        })
        console.log("Table 'adminConnecte' créée! ")
    }
}


/* Exporte l'objet db et la fonction createTable */
module.exports = {
    db,
    createTable
};
