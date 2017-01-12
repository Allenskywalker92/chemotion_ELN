const splSettings = [ {text: "diagram", checked: true},
                      {text: "collection", checked: true},
                      {text: "analyses content", checked: true},
                      {text: "analyses description", checked: true} ]
const rxnSettings = [ {text: "diagram", checked: true},
                      {text: "material", checked: true},
                      {text: "description", checked: true},
                      {text: "purification", checked: true},
                      {text: "tlc", checked: true},
                      {text: "observation", checked: true},
                      {text: "analysis", checked: true},
                      {text: "literature", checked: true} ]
const configs = [ {text: "Page Break", checked: true},
                  {text: "Show all material in diagrams (unchecked to show Products only)", checked: true} ]

const originalState = {
  splSettings: splSettings,
  rxnSettings: rxnSettings,
  configs: configs,
  checkedAllSplSettings: true,
  checkedAllRxnSettings: true,
  checkedAllConfigs: true,
  processingReport: false,
  selectedObjTags: { sampleIds: [], reactionIds: [] },
  selectedObjs: [],
  imgFormat: 'png'
}

export { originalState, splSettings, rxnSettings, configs }
