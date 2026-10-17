import {PROPOSAL_TYPES} from '../../src/ai/contracts.js'

// Wire representation of the existing contract, not a replacement validator.
// Keep to structural JSON Schema keywords; semantic pairs, lengths, counts,
// literal quotes and fidelity are still checked locally or by human review.
export function proposalResponseFormat(sourceIds) {
  return {type:'json_schema',json_schema:{name:'discovery_proposals_v1',strict:true,schema:{
    type:'object',additionalProperties:false,required:['proposals'],properties:{
      proposals:{type:'array',items:{type:'object',additionalProperties:false,
        required:['type','title','content','reasoning','certainty','references'],properties:{
          type:{type:'string',enum:Object.values(PROPOSAL_TYPES)},
          title:{type:'string'},content:{type:'string'},reasoning:{type:'string'},
          certainty:{type:'string',enum:Object.keys(PROPOSAL_TYPES)},
          references:{type:'array',items:{type:'object',additionalProperties:false,required:['sourceId','quote'],properties:{
            sourceId:{type:'string',enum:[...sourceIds]},quote:{type:'string'},
          }}},
        },
      }},
    },
  }}}
}

export function matchesProposalSchema(value, sourceIds) {
  function matches(node,schema) {
    if(schema.enum && !schema.enum.includes(node))return false
    if(schema.type==='string')return typeof node==='string'
    if(schema.type==='array')return Array.isArray(node) && node.every(item=>matches(item,schema.items))
    if(schema.type==='object')return !!node && typeof node==='object' && !Array.isArray(node) && schema.required.every(key=>Object.hasOwn(node,key)) && Object.keys(node).every(key=>Object.hasOwn(schema.properties,key) && matches(node[key],schema.properties[key]))
    return false
  }
  return matches(value,proposalResponseFormat(sourceIds).json_schema.schema)
}
