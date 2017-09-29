# frozen_string_literal: true

require 'rails_helper'

describe Chemotion::ReportAPI do
  context 'authorized user logged in' do
    let(:user) { create(:user) }
    let(:other) { create(:user) }
    let(:docx_mime_type) {
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    }
    let(:excel_mime_type) { 'application/vnd.ms-excel' }
    let!(:rp1) {
      create(:report, :downloadable, user: user, file_name: 'ELN_Report_1')
    }
    let!(:rp2) { create(:report, :undownloadable, user: user) }
    let!(:rp3) { create(:report, :downloadable, user: user) }
    let!(:rp_others) { create(:report, user: other) }
    let!(:s1)   { create(:sample) }
    let!(:s2)   { create(:sample) }
    let!(:r1)   { create(:reaction, id: 1) }
    let!(:r2)   { create(:reaction, id: 2) }
    let!(:c)    { create(:collection, user_id: user.id) }

    before do
      allow_any_instance_of(WardenAuthentication).to(
        receive(:current_user).and_return(user)
      )
      CollectionsSample.create!(sample: s1, collection: c)
      CollectionsSample.create!(sample: s2, collection: c)
      CollectionsReaction.create!(reaction: r1, collection: c)
      CollectionsReaction.create!(reaction: r2, collection: c)
    end

    describe 'GET /api/v1/reports/docx' do
      before do
        params = { id: r1.id.to_s }
        get '/api/v1/reports/docx', params
      end

      it 'returns a header with docx-type' do
        expect(response['Content-Type']).to eq(docx_mime_type)
        expect(response['Content-Disposition']).to include('.docx')
      end
    end

    describe 'POST /api/v1/reports/export_samples_from_selections' do
      let(:c)        { create(:collection, user_id: user.id) }
      let(:sample_1) { create(:sample) }
      let(:sample_2) { create(:sample) }

      before do
        CollectionsSample.create!(sample: sample_1, collection: c)
        CollectionsSample.create!(sample: sample_2, collection: c)
      end

      before do
        params = {
          type: 'sample',
          exportType: 1,
          checkedIds: [sample_1.id],
          uncheckedIds: [],
          checkedAll: false,
          currentCollection: c.id,
          removedColumns: %w(
            target_amount_value target_amount_unit
            created_at updated_at molfile
          )
        }
        post(
          '/api/v1/reports/export_samples_from_selections', params.to_json,
          'HTTP_ACCEPT' => 'application/vnd.ms-excel, chemical/x-mdl-sdfile',
          'CONTENT_TYPE' => 'application/json'
        )
      end

      it 'returns a header with excel-type' do
        expect(response['Content-Type']).to eq(excel_mime_type)
        expect(response['Content-Disposition']).to include('.xlsx')
      end
    end

    describe 'GET /api/v1/archives/all' do
      before do
        get '/api/v1/archives/all'
      end

      it 'return all reports of the user' do
        archives = JSON.parse(response.body)['archives']
        expect(archives.count).to eq(3)
        expect(archives.map { |a| a['id'] }).to include(rp1.id, rp2.id, rp3.id)
      end
    end

    describe 'POST /api/v1/archives/downloadable' do
      before do
        params = { ids: [rp3.id, rp2.id] }
        post '/api/v1/archives/downloadable', params
      end

      it 'return reports which can be downloaded now' do
        archives = JSON.parse(response.body)['archives']
        expect(archives.count).to eq(1)
        expect(archives.first['id']).to eq(rp3.id)
      end
    end

    describe 'Delete /api/v1/archives/' do
    #  let!(:a_mine) { user.reports.create }
    #  let!(:a_others) { other.reports.create }

      context 'my archive' do
        before do
          delete "/api/v1/archives/#{rp1.id}"
        end

        it 'delete the archive' do
          archive = Report.find_by(id: rp1.id)
          expect(response.status).to eq 200
          expect(archive).to be_nil
        end
      end

      context 'other\'s archive' do
        before do
          delete "/api/v1/archives/#{rp_others.id}"
        end

        it 'can not delete the archive' do
          archive = Report.find_by(id: rp_others.id)
          expect(response.status).to eq 404
          expect(archive).not_to be_nil
        end
      end
    end

    describe 'POST /api/v1/reports' do
      let(:fileName) { 'ELN' }
      let(:params) do
        {
          objTags: "[{\"id\":#{r1.id},\"type\":\"reaction\"}, \
            {\"id\":#{r2.id},\"type\":\"reaction\"}]",
          splSettings: "[{\"text\":\"diagram\",\"checked\":true}, \
            {\"text\":\"analyses\",\"checked\":true}]",
          rxnSettings: "[{\"text\":\"diagram\",\"checked\":true}, \
            {\"text\":\"material\",\"checked\":true}]",
          configs: "[{\"text\":\"page_break\",\"checked\":true}, \
            {\"text\":\"whole_diagram\",\"checked\":true}]",
          imgFormat: 'png',
          fileName: fileName,
          molSerials: "[{\"mol\":{\"id\":1, \"svgPath\":\"1a.svg\", \
            \"sumFormula\":\"C6H6\", \"iupacName\":\"benzene\"}, \
            \"value\":\"1a\"}]"
        }
      end

      it 'returns a created -standard- report' do
        params[:template] = "standard"
        post '/api/v1/reports', params
        expect(response.body).to include(fileName)
      end

      it 'returns a created -supporting_information- report' do
        params[:template] = "supporting_information"
        post '/api/v1/reports', params
        expect(response.body).to include(fileName)
      end
    end

    describe 'GET /api/v1/download_report/docx' do
      before do
        params = { id: rp1.id }
        allow(File).to receive(:read).and_return('stubbed read')
        get '/api/v1/download_report/docx', params
      end

      it 'returns a header with docx-type' do
        expect(response['Content-Type']).to eq(docx_mime_type)
        expect(response['Content-Disposition']).to(
          include(rp1.file_name + '.docx')
        )
      end
    end
  end
end
