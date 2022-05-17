const StyleDictionary = require('style-dictionary');

// Return something like "var(--color-blue)"
function convertToVariableIfNeeded(value) {
  if (value.startsWith("{") && value.endsWith("}")) {
    return `var(--${value.slice(1, -1).replace(".", "-")})`;
  }
  return value;
}

// Auto generate Style Dictionary config file

// Color Format
StyleDictionary.registerFormat({
    name: 'scss/variables',
    formatter: function (dictionary, config) {
      return `${this.selector} {
        ${dictionary.allProperties.map(prop => `$${prop.name}: ${prop.value};`).join('\n')}
      }`
    }
  });  


  // Text Format
  StyleDictionary.registerFormat({
    name: "scss/typography",
    formatter: (dictionary, config) => (dictionary.allProperties.map((prop) => (`
  .${prop.name} {
    font: var(--${prop.name});
    letter-spacing: ${convertToVariableIfNeeded(
      prop.original.value.letterSpacing
    )};
    text-transform: ${convertToVariableIfNeeded(prop.original.value.textCase)};
    text-decoration: ${convertToVariableIfNeeded(
      prop.original.value.textDecoration
    )};
  }`)).join("\n"))
  });


// Transformer for Style Dictionary
// Colors
StyleDictionary.registerTransform({
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

StyleDictionary.registerTransform({
  name: 'scss/typography',
  type: 'value',
  transitive: true,
  matcher: (token) => token.type === "typography",
  transformer: (token) => {

    const {fontWeight, fontSize, lineHeight, fontFamily} = token.original.value;
    return `${fontWeight} ${fontSize}/${lineHeight} ${fontFamily}`;

    // const typographyProps = token.original.value;
    // const typographyPropsArray = [];

    // for (let prop in typographyProps) {
    //   if(prop === 'fontWeight') {
    //     typographyPropsArray.push(`"${prop}": ${fontWeights[typographyProps[prop]]}`);
    //   } else if (["lineHeight", "fontSize", "paragraphSpacing"].includes(prop)) {
    //     typographyPropsArray.push(`"${prop}": ${typographyProps[prop]}px`);
    //   } else {
    //     typographyPropsArray.push(`"${prop}": ${typographyProps[prop]}`);
    //   }
    // }
    // return `(${typographyPropsArray.join()})`;
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

    const StyleDictionary = StyleDictionary.extend(getStyleDictionaryConfig(brand));

    StyleDictionary.buildPlatform('web');

    console.log('\nEnd processing');
})

console.log('\n==============================================');
console.log('\nBuild completed!');
