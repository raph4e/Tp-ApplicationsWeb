/* Récupère le package knex */
const knex = require('knex')

/* Créer une instance de base de données */
const db = knex({
    client: 'sqlite3',
    /* Indique le nom du fichier dont on souhaite connecter la base de données */
    connection: { 
        filename: "./TP-APPLICATIONSWEB/serveur.sqlite3"       
    },
    /* Utiliser la valeur null comme valeur par défaut */
    useNullAsDefault: true
});

/* Fonction qui vérifie si la table clients existe, et la créé si ce n'est pas le cas */
async function createTable() {
    const exist = await db.schema.hasTable("clients");

    /* Si la table n'existe pas, on la crée */
    if (!exist) {
        await db.schema.createTable("clients", (table) => {
            table.string("id").primary();
            table.string("nom").notNullable();
            table.string("prénom").notNullable();
            table.string("email").notNullable();
            table.int("numéroDeTéléphone").notNullable();
            table.string("adresse").notNullable();
            table.timestamp("create_at").defaultTo(db.fn.now());
        });
        console.log("Table 'clients' créée !");
    }
}


/* Exporte l'objet db et la fonction createTable */
module.exports = {
    db,
    createTable
};
