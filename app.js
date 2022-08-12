const axios = require('axios');
const Webflow = require('webflow-api');
const parseString = require('xml2js').parseString;
const diff = require('arr-diff');
const dotenv = require('dotenv');
dotenv.config({ path: './config.env' });

const api_key = process.env.API_KEY;
const palaceEmail = process.env.PALACE_LOGIN;
const palacePass = process.env.PALACE_PASSWORD;
const site_id = process.env.SITE_ID;
const webflow_domain = process.env.WEBFLOW_DOMAIN;
let collections_id = process.env.COLLECTION_ID;

let itemCodetoDelete, itemPropCodeToDelete, listOfItems,itemsToDelete, name, propertyaddress1, propertyaddress2, propertyaddress3, propertyaddress4, propertycode;
let uniqueWebflowPropertyCodes = [];
let uniquePalacePropertyCodes = [];

const webflow = new Webflow({
    token: api_key
});

const getPalaceListings = async () => {
    try {
        const response = await axios.get('https://api.getpalace.com/Service.svc/RestService/v2ViewAllDetailedProperty/JSON', {
            headers: {
                'Content-Type': 'application/json'
            },
            auth: {
                username: palaceEmail,
                password: palacePass
            }
        });

        const properties = response.data;
        
        const headerDate = response.headers && response.headers.date ? response.headers.date : 'no response date';
        console.log(' ');
        console.log(' ');
        console.log('****************************');
        console.log('Status Code:', response.status);
        console.log('Date in Response header:', headerDate);
        console.log('****************************');
        console.log(' ');
        console.log(`Properties.Length: ${properties.length}`);
        console.log(' ');

        //Simple sleep function to get around the API call restrictions in Webflow
        function sleep(ms) {
            return new Promise(resolve => setTimeout(resolve, ms));
        }

        //function that recursively invokes itself
        (async function loopProperties() { // Might have to add 'await' to make sure looping properties finishes before site gets published!
            for (const property of properties) {
                uniquePalacePropertyCodes.push(property.PropertyCode);
    
                propertycode        = property.PropertyCode
                propertyaddress1    = property.PropertyAddress1;
                propertyaddress2    = property.PropertyAddress2;
                propertyaddress3    = property.PropertyAddress3;
                propertyaddress4    = property.PropertyAddress4;
                name = `${propertyaddress1} ${propertyaddress2} ${propertyaddress3} ${propertyaddress4}`;
                console.log(`Name: ${name}`);
                console.log(`Property Code: ${property.PropertyCode}, Address: ${property.PropertyAddress1 + " " + property.PropertyAddress2}`);
    
                await getImages(propertycode)
                .then(imgArr => {
                    propertyimageArray = imgArr;
                });
                
                await pullData();

                //call sleep function from above (might have to increase timer)
                await sleep(5000);
    
            }
        })();

        // publishToSite()
        
    } catch (err) {
        console.log(`Error - Problem loading listing: ${err}`); 
    }
    
};

function getImages(code) {
    console.log(`Property Code for Image: ${code}`);
    return axios.get('https://api.getpalace.com/Service.svc/RestService/v2AvailablePropertyImagesURL/JSON/' + code, {
        headers: {
            'Content-Type': 'application/json'
        },
        auth: {
            username: palaceEmail,
            password: palacePass
        }
    })
    .then((response) => {
        const imagesArray = response.data;

        let propertyImages = [];

        for (const image of imagesArray) {
            propertyImages.push(image.PropertyImageURL);
        }
        console.log(`getImages() Array: ${propertyImages}`);
        console.log(`getImages() Array Length: ${propertyImages.length}`);
        console.log(`getImages() Array First Element: ${propertyImages[0]}`);
        return propertyImages;
    })
    .catch((err) => {
        console.log(`Error - Problems loading image: ${err}`);
    })
}

//Pull and init create if doesn't exist
async function pullData() {
    return webflow.items({
      collectionId: collections_id
    })
    .then(res => {
        listOfItems = res.items;
        for (var i = 0; i < listOfItems.length; i++) {
            uniqueWebflowPropertyCodes.push(listOfItems[i].propertycode);
        }
        console.log(`Unique Webflow Property Codes: ${uniqueWebflowPropertyCodes}`);
        console.log(`Palace Property Code to be imported: ${propertycode}`);
        console.log(`Palace Property Image: ${propertyimageArray[0]}`);
        console.log(`Palace Property Image Array: ${propertyimageArray}`);
        console.log(`Palace Property Image Array Length: ${propertyimageArray.length}`);
        if (uniqueWebflowPropertyCodes.includes(propertycode)) {
            console.log("Property exists already - STOP");
        } else {
            create();
        }
        //Checking to see if there is anything inside webflow thats not inside Palace to delete
        checkLiveItems();
    });
};

function create() {
    try {
        function createJsonArray() {
            const jsonArray = [];

            propertyimageArray.forEach(el => {
                string = '{ "url": "' + el + '" }';
                obj = JSON.parse(string);
                jsonArray.push(obj);
            });
            //console.log(jsonArray);
            // Output:
            // [
            //     { 'url': 'http://images.getpalace.com/0e2c2606-1a59-4df7-b346-d20c7c153349/RBPI000084.jpg' }
            // ]
            return jsonArray;
        }

        webflow.createItem({
            collectionId: collections_id,
            fields: {
                'name': name,
                'propertycode': propertycode,
                'propertyaddress1': propertyaddress1,
                'propertyaddress2': propertyaddress2,
                'propertyaddress3': propertyaddress4,
                'propertyaddress4': propertyaddress4,
                'propertyimage': {
                    'url': propertyimageArray[0]
                },
                'propertyimages-2': createJsonArray(),
                // [
                    // {
                    //     'url': 'http://images.getpalace.com/0e2c2606-1a59-4df7-b346-d20c7c153349/RBPI000021.jpg'
                    // },
                    // {
                    //     'url': "http://images.getpalace.com/0e2c2606-1a59-4df7-b346-d20c7c153349/RBPI000066.jpg"
                    // }
                // ],
                '_archived': false,
                '_draft': false,
            },
        });
        console.log(`Created item ${name}`);
    } catch (err) {
        console.log(`Error - Problem creating listing: ${err}`); 
    }
}

//Checking to see if there is anything inside webflow thats not inside Palace to delete
function checkLiveItems() {
    // diff(): Returns an array with only the unique values from the first array, by
    // excluding all values from additional arrays using strict equality for comparisons.
    itemsToDelete = diff(uniqueWebflowPropertyCodes, uniquePalacePropertyCodes);
    if (itemsToDelete.length == 0){
        console.log("Nothing to delete - STOP");
        return;
    } else {
        for (var i = 0; i < itemsToDelete.length; i++) {
            itemPropCodeToDelete = itemsToDelete[i];
            for (var i = 0; i < listOfItems.length; i++) {
                if (listOfItems[i].propertycode == itemPropCodeToDelete) {
                itemCodetoDelete = listOfItems[i]._id;
                deleteItem();
                }
            }
        }
    }
}

function deleteItem() {
    webflow.removeItem({
      collectionId: collections_id,
      itemId: itemCodetoDelete
    })
    .then(res => {
      console.log(`Delete item ${itemPropCodeToDelete} - STOPPED`);
    });
}

// Publishing data to process.env.WEBFLOW_DOMAIN
function publishToSite() {
    webflow.publishSite({
        siteId: site_id,
        domains: [webflow_domain]
    })
    .then(res => {
        console.log(`Published site to ${webflow_domain}!`);
      }); 
}


getPalaceListings();

