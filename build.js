const StyleDictionaryPackage = require('style-dictionary');

// Auto generate Style Dictionary config file

const fontWeights = {
  'Light': '200',
  'Light Italic': '200',
  'Regular': '400',
  'Italic': '400',
  'Bold': '700'
}

// Color Format
StyleDictionaryPackage.registerFormat({
    name: 'scss/variables',
    formatter: function (dictionary, config) {
      return `${this.selector} {
        ${dictionary.allProperties.map(prop => `$${prop.name}: ${prop.value};`).join('\n')}
      }`
    }
  });  

// Transformer for Style Dictionary
StyleDictionaryPackage.registerTransform({
    name: 'sizes/px',
    type: 'value',
    matcher: function(prop) {
        return ["fontSize", "paragraphSpacing", "lineHeight", "spacing", "borderRadius", "borderWidth", "sizing"].includes(prop.attributes.category);
    },
    transformer: function(prop) {
        console.log("prop", prop)
        if(prop === 'fontWeight') return fontWeights[prop]; // replace "Bold/Regular/etc." with weight
        return parseFloat(prop.original.value) + 'px';
    }
    });



function getStyleDictionaryConfig(brand) {
  return {
    "source": [
      `tokens/${brand}.json`,
    ],
    "platforms": {
      "web": {
        "transforms": ["attribute/cti", "name/cti/kebab", "sizes/px"],
        "buildPath": `output/`,
        "files": [{
            "destination": `${brand}.scss`,
            "format": "scss/variables",
            "selector": `.${brand}-theme`
          }]
      }
    }
  };
}

console.log('Build started...');

// PROCESS THE DESIGN TOKENS FOR THE DIFFEREN BRANDS AND PLATFORMS
['pangea', 'apollo', 'artemis'].map(function (brand) {

    console.log('\n==============================================');
    console.log(`\nProcessing: [${brand}]`);

    const StyleDictionary = StyleDictionaryPackage.extend(getStyleDictionaryConfig(brand));

    StyleDictionary.buildPlatform('web');

    console.log('\nEnd processing');
})

console.log('\n==============================================');
console.log('\nBuild completed!');
