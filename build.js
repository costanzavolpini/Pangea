const StyleDictionaryPackage = require('style-dictionary');

// Auto generate Style Dictionary config file
StyleDictionaryPackage.registerFormat({
    name: 'scss/variables',
    formatter: function (dictionary, config) {
      return `${this.selector} {
        ${dictionary.allProperties.map(prop => `$${prop.name}: ${prop.value};`).join('\n')}
      }`
    }
  });  

// Transformer for Style Dictionary
// Colors
StyleDictionaryPackage.registerTransform({
    name: 'sizes/px',
    type: 'value',
    matcher: function(prop) {
        return ["fontSize", "spacing", "borderRadius", "borderWidth", "sizing"].includes(prop.attributes.category);
    },
    transformer: function(prop) {
        return parseFloat(prop.original.value) + 'px';
    }
    });

// Texts
const fontWeights = {
  'Light': '200',
  'Light Italic': '200',
  'Regular': '400',
  'Italic': '400',
  'Bold': '700'
}

StyleDictionaryPackage.registerTransform({
  name: 'scss/typography',
  type: 'value',
  matcher: function(token) {
    return token.original.type === 'typography';
  },
  transformer: function(token) {
    const typographyProps = token.original.value;
    const typographyPropsArray = [];

    for (let prop in typographyProps) {
      if(prop === 'fontWeight') {
        typographyPropsArray.push(`"${prop}": ${fontWeights[typographyProps[prop]]}`);
      } else if (["lineHeight", "fontSize", "paragraphSpacing"].includes(prop)) {
        typographyPropsArray.push(`"${prop}": ${typographyProps[prop]}px`);
      } else {
        typographyPropsArray.push(`"${prop}": ${typographyProps[prop]}`);
      }
    }
    return `(${typographyPropsArray.join()})`;
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
