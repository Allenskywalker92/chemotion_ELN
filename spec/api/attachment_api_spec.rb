require 'rails_helper'

describe Chemotion::AttachmentAPI do
  let(:file_upload) {
    {
      file_1: fixture_file_upload('spec/fixtures/upload.txt', 'text/plain'),
      file_2: fixture_file_upload('spec/fixtures/upload.txt', 'text/plain')
    }
  }
  let(:img_upload) {
    {
      file_1: fixture_file_upload('spec/fixtures/upload.jpg')
    }
  }

  let(:user)  { create(:user, first_name: 'Person', last_name: 'Test') }
  let(:u2)    { create(:user) }
  let(:group) { create(:group)}
  let!(:owner) { create(:user) }
  let(:new_attachment) { build(:attachment)}
  let(:new_local_attachment) { build(:attachment, storage: 'local')}

  context 'authorized user logged in' do
    let(:attachments) {
      Attachment.where(created_by: user, filename: 'upload.txt')
    }
    let(:img_attachment) {
      Attachment.where(created_by: user, filename: 'upload.jpg')
    }

    before do
      allow_any_instance_of(WardenAuthentication).to receive(:current_user).and_return(user)
    end

    describe 'upload files thru POST attachments/upload_dataset_attachments' do
      before do
         post '/api/v1/attachments/upload_dataset_attachments', file_upload
      end

      it 'creates attachments for each file' do
        expect(attachments.count).to eq 2
      end

      it 'stores file localy' do
        expect(File.exist?(attachments.last.store.path)).to be true
      end
    end

    describe 'upload img thru POST attachments/upload_dataset_attachments' do
      before do
         post '/api/v1/attachments/upload_dataset_attachments', img_upload
      end

      it 'creates attachments for each file' do
        expect(img_attachment.count).to eq 1
      end

      it 'stores file localy' do
        expect(File.exist?(img_attachment.last.store.path)).to be true
      end

      it 'creates thumbnail localy' do
        expect(File.exist?(img_attachment.last.store.thumb_path)).to be true
      end
    end

    after(:all) do
      `rm -rf #{File.join(Rails.root,'tmp','test')}`
      puts "delete tmp folder #{File.join(Rails.root,'tmp','test')} "
    end
  end
end

describe Chemotion::SampleAPI do
  let(:u1) { create(:person, first_name: 'Person', last_name: 'Test') }
  let(:c1) { create(:collection, user_id: u1.id) }
  let!(:cont_s1_root) { create(:container) } #, containable_id: s1.id, containable_type: 'Sample', container_type: 'root', name: 'root') }
  let!(:s1) {
    create(:sample_without_analysis, name: 'sample 1', container: cont_s1_root)
  }
  let!(:cont_s1_analyses) { create(:container, container_type: 'analyses') }
  let!(:cont_s1_analysis) { create(:analysis_container) }
  #let!(:cont_s1_dataset)  { create(:container, container_type: 'dataset') }

   let(:u2) { create(:user) }
   let(:c2) { create(:collection, user_id: u2.id) }
  # let(:c12) { create(:collection, user_id: u1.id, is_shared: true, permission_level: 1) }
   let!(:cont_s2_root) { create(:container) }
   let!(:s2) {
     create(:sample_without_analysis, name: 'sample 2', container: cont_s2_root)
   }
   let!(:cont_s2_analyses) { create(:container, container_type: 'analyses') }
   let!(:cont_s2_analysis) { create(:analysis_container) }
   let!(:cont_s2_dataset)  { create(:container, container_type: 'dataset') }

  let!(:attachment) {
    create(
      :attachment,
      storage: 'tmp', key: '8580a8d0-4b83-11e7-afc4-85a98b9d0194',
      filename: 'upload.jpg',
      file_path: File.join(Rails.root,'spec/fixtures/upload.jpg'),
      created_by: u1.id,
      created_for: u1.id,
    )
  }

  let(:sample_upd_1_params) {
    JSON.parse(
      IO.read(File.join(
        Rails.root,'spec','fixtures',
        'sample_update_1_params.json'
      ))
    ).deep_symbolize_keys
  }

  before do
    allow_any_instance_of(WardenAuthentication).to receive(:current_user)
                                               .and_return(u1)
    CollectionsSample.create!(sample: s1, collection: c1)

    cont_s1_root.children << cont_s1_analyses
    cont_s1_root.save!
    cont_s1_analyses.children << cont_s1_analysis
    cont_s1_analyses.save!
    #cont_s1_analysis.children << cont_s1_dataset
    #cont_s1_analysis.save
    s1.save

    sample_upd_1_params[:id] = s1.id
    sample_upd_1_params[:container][:id] = s1.container.id
    sample_upd_1_params[:container][:children][0][:id] =  s1.container.children[0].id#cont_s1_analyses.id
    sample_upd_1_params[:container][:children][0][:children][0][:id] = s1.container.children[0].children[0].id#cont_s1_analysis.id

  end

  context 'upload file and update sample analysis' do
    context 'with appropriate permissions' do

      describe 'updating sample 1 analysis with a new dataset having a new img file' do
        before do
          put(
            "/api/v1/samples/#{s1.id}.json", sample_upd_1_params.to_json,
            'CONTENT_TYPE' => 'application/json'
          )
        end

        it 'returns 200 status code' do
          expect(response.status).to eq 200
        end

        it 'has updated the analysis description' do
          expect(s1.analyses.first.description).to eq('updated description')
        end

        it 'has created a dataset for the corresponding analysis' do
         expect(cont_s1_analysis.children.count).to eq(1)
         #expect{put("/api/v1/samples/#{s1.id}.json", sample_upd_1_params)}.to change{s1.analyses.first.children.count}.by 1
        end

        it 'has created an attachment for the new dataset' do
          expect(Attachment.count).to eq(1)
          expect(
            s1.analyses.first.children.first.attachments.first
          ).to eq(attachment)
        end

        it 'has stored the file in the primary storage' do
          expect(
            s1.analyses.first.children.first.attachments.first.storage
          ).to eq(Rails.configuration.storage.primary_store)
          expect(
            s1.analyses.first.children.first.attachments.first.store.file_exist?
          ).to be true
        end
      end
    end

    context 'with inappropriate permissions' do
      before do
        CollectionsSample.create!(sample: s2, collection: c2)
        cont_s2_root.children << cont_s2_analyses
        cont_s2_root.save!
        cont_s2_analyses.children << cont_s2_analysis
        cont_s2_analyses.save!
        cont_s2_analysis.children << cont_s2_dataset
        cont_s2_analysis.save
        s2.save

      end
      describe 'updating sample 1 analysis with a foreign analysis having a new img file' do
        before do
          sample_upd_1_params[:container][:children][0][:id] =  s2.container.children[0].id#cont_s1_analyses.id
          #sample_upd_1_params[:container][:children][0][:children][0][:id] = s2.container.children[0].children[0].id
          put(
            "/api/v1/samples/#{s1.id}.json", sample_upd_1_params.to_json,
            'CONTENT_TYPE' => 'application/json'
          )
        end

        it 'returns 200 status code' do
          expect(response.status).to eq 200
        end
        it 'has not created a dataset for the corresponding analysis' do
          expect(cont_s2_analysis.children.count).to eq(1)
          expect{
            put(
              "/api/v1/samples/#{s1.id}.json", sample_upd_1_params.to_json,
              'CONTENT_TYPE' => 'application/json'
            )
          }.to change{s2.analyses.first.children.count}.by 0
        end
      end
    end

  end
end
