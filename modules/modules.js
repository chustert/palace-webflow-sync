const Webflow = require('webflow-api');
const dotenv = require('dotenv');
dotenv.config({ path: './config.env' });

const api_key = process.env.API_KEY;
const site_id = process.env.SITE_ID;

const webflow = new Webflow({
    token: api_key
});

// function to pull collections and number of collections
async function pullWebflowCollections() {
    return webflow.collections({
        siteId: site_id
    })
}

// async function pullWebflowItems(uniqueWebflowCollection) {
//     return webflow.items({
//         collectionId: uniqueWebflowCollection
//     })
// }


// HELPER FUNCTIONS
function isInt(value) {
    if (isNaN(value)) {
      return false;
    }
    var x = parseFloat(value);
    return (x | 0) === x;
}


module.exports = {
    pullWebflowCollections,
    isInt
}
