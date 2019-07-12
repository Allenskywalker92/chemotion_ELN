
module Chemotion
    # OLS Terms API
    # rubocop:disable ClassLength
    class OlsTermsAPI < Grape::API
      # rubocop:disable Metrics/BlockLength
      namespace :ols_terms do
        desc 'Get List'
        params do
          requires :name, type: String, desc: "OLS Name", values: %w[chmo rxno]
          optional :edited, type: Boolean, default: true, desc: 'Only list visible terms'
        end

        get 'list' do
          file = Rails.public_path.join(
            'ontologies',
            "#{params[:name]}#{params[:edited] ? '.edited.json' : '.json'}"
          )
          result = JSON.parse(File.read(file, encoding:  'bom|utf-8')) if File.exist?(file)
          recent_term_ids = current_user.profile&.data&.fetch(params[:name], nil)
          result['ols_terms'][0]['children'] = recent_term_ids if recent_term_ids.present?
          result
        end

        get 'root' do
          list = OlsTerm.where(owl_name: params[:name], is_enabled: true, ancestry: nil)
          { ols_terms: present(list, with: Entities::OlsTermEntity) }
        end
      end
    end
end
