import 'whatwg-fetch';
import _ from 'lodash';
import ResearchPlan from '../models/ResearchPlan';
import AttachmentFetcher from './AttachmentFetcher';
import BaseFetcher from './BaseFetcher';


export default class ResearchPlansFetcher {
  static fetchById(id) {
    let promise = fetch('/api/v1/research_plans/' + id + '.json', {
        credentials: 'same-origin'
      })
      .then((response) => {
        return response.json()
      }).then((json) => {
        const rResearchPlan = new ResearchPlan(json.research_plan);
        if (json.error) {
          rResearchPlan.id = `${id}:error:ResearchPlan ${id} is not accessible!`;
        }
        return rResearchPlan;
      }).catch((errorMessage) => {
        console.log(errorMessage);
      });

    return promise;
  }

  static fetchByCollectionId(id, queryParams={}, isSync = false) {
    return BaseFetcher.fetchByCollectionId(id, queryParams, isSync, 'research_plans', ResearchPlan);
  }

  static update(researchPlan) {
    const newFiles = (researchPlan.attachments || []).filter(a => a.is_new && !a.is_deleted);
    const delFiles = (researchPlan.attachments || []).filter(a => !a.is_new && a.is_deleted);
    const promise = fetch('/api/v1/research_plans/' + researchPlan.id, {
      credentials: 'same-origin',
      method: 'put',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(researchPlan.serialize())
    }).then((response) => {
      return response.json();
    }).then((json) => {
      if (newFiles.length <= 0 && delFiles.length <= 0) {
        return new ResearchPlan(json.research_plan);
      }
      return AttachmentFetcher.updateAttachables(newFiles, 'ResearchPlan', json.research_plan.id, delFiles)()
        .then(() => {
          const result = _.differenceBy(json.research_plan.attachments, delFiles, 'id');
          const newResearchPlan = new ResearchPlan(json.research_plan);
          newResearchPlan.attachments = _.concat(result, newFiles);
          return new ResearchPlan(newResearchPlan);
        });
    }).catch((errorMessage) => {
      console.log(errorMessage);
    });
    return promise;
  }

  static updateSVGFile(svg_file, isChemdraw = false) {
    let promise = ()=> fetch('/api/v1/research_plans/svg', {
      credentials: 'same-origin',
      method: 'post',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ svg_file: svg_file, is_chemdraw: isChemdraw })
    }).then((response) => {
      return response.json()
    }).catch((errorMessage) => {
      console.log(errorMessage);
    });
    return promise();
  }

  static create(researchPlan) {
    const files = (researchPlan.attachments || []).filter(a => a.is_new && !a.is_deleted);
    const promise = fetch('/api/v1/research_plans/', {
      credentials: 'same-origin',
      method: 'post',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(researchPlan.serialize())
    }).then((response) => {
      return response.json();
    }).then((json) => {
      if (files.length <= 0) {
        return new ResearchPlan(json.research_plan);
      }
      return AttachmentFetcher.updateAttachables(files, 'ResearchPlan', json.research_plan.id, [])()
        .then(() => new ResearchPlan(json.research_plan));
    }).catch((errorMessage) => {
      console.log(errorMessage);
    });
    return promise;
  }
}
