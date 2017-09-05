const splSettings = [ {text: "diagram", checked: true},
                      {text: "collection", checked: true},
                      {text: "analyses", checked: true},
                      {text: "reaction description", checked: true} ]
const rxnSettings = [ {text: "diagram", checked: true},
                      {text: "material", checked: true},
                      {text: "description", checked: true},
                      {text: "purification", checked: true},
                      {text: "tlc", checked: true},
                      {text: "observation", checked: true},
                      {text: "analysis", checked: true},
                      {text: "literature", checked: true} ]
const configs = [ {text: "Page Break", checked: true},
                  {text: "Show all chemicals in schemes (unchecked to show products only)", checked: true} ]

const originalState = {
  splSettings: splSettings,
  rxnSettings: rxnSettings,
  configs: configs,
  checkedAllSplSettings: true,
  checkedAllRxnSettings: true,
  checkedAllConfigs: true,
  processingReport: false,
  defaultObjTags: { sampleIds: [], reactionIds: [] },
  selectedObjTags: { sampleIds: [], reactionIds: [] },
  selectedObjs: [],
  imgFormat: 'png',
  archives: [],
  fileName: 'ELN_report',
  fileDescription: '',
  activeKey: 0,
  processings: [],
  template: "supporting_information",
}

export { originalState, splSettings, rxnSettings, configs }
