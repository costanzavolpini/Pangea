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
  matcher: function (prop) {
    const toMatch = ["fontSize", "paragraphSpacing", "lineHeight", "spacing", "borderRadius", "borderWidth", "sizing"];
    console.log("candidate for px", prop);
    console.log("result", toMatch.includes(prop.attributes.category) || toMatch.includes(prop.attributes.item));
    return toMatch.includes(prop.attributes.category) || toMatch.includes(prop.attributes.item);
  },
  transformer: function (prop) {
    console.log("1before transformation ", prop.value)
    console.log("1after transformation ", parseFloat(prop.original.value) + 'px')
    return parseFloat(prop.original.value) + 'px'; // append px
  }
});


StyleDictionaryPackage.registerTransform({
  name: 'fontWeight',
  type: 'value',
  matcher: function (prop) {
    console.log("candidate for font weight", prop);
    console.log("result", (prop.attributes.category == "fontWeight") || (prop.attributes.item == "fontWeight"));
    return (prop.attributes.category == "fontWeight") || (prop.attributes.item == "fontWeight");
  },
  transformer: function (prop) {
    console.log("2before transformation ", prop.value)
    console.log("2after transformation ", fontWeights[prop])
    return fontWeights[prop]; // replace "Bold/Regular/etc." with weight
  }
});


StyleDictionaryPackage.registerTransform({
  name: 'fontFamily',
  type: 'value',
  matcher: function (prop) {
    console.log("candidate family", prop)
    console.log("result", (prop.attributes.category == "fontFamilies") || (prop.attributes.item == "fontFamilies"))
    return (prop.attributes.category == "fontFamilies") || (prop.attributes.item == "fontFamilies");
  },
  transformer: function (prop) {
    console.log("3before transformation ", prop.value)
    console.log("3after transformation ", "" + prop.original.value)
    return "" + prop.original.value; // font family e.g., brown pro should be a string TODO: udpate with correct string (switch based on brand)
  }
});



function getStyleDictionaryConfig(brand) {
  return {
    "source": [
      `tokens/${brand}.json`,
    ],
    "platforms": {
      "web": {
        "transforms": ["attribute/cti", "name/cti/kebab", "sizes/px", "fontWeight", "fontFamily"],
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
