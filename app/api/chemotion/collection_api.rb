module Chemotion
  class CollectionAPI < Grape::API
    resource :collections do
      desc "Return all unshared serialized collection roots of current user"
      get :roots do
        current_user.collections.ordered.unshared.roots
      end

      desc "Return all shared serialized collection roots"
      get :shared_roots do
        Collection.shared(current_user.id).roots
      end

      desc "Return all remote serialized collection roots"
      get :remote_roots do
        current_user.collections.remote(current_user.id).roots
      end

      desc "Bulk update and/or create new collections"
      patch '/' do
        Collection.bulk_update(current_user.id, params[:collections].as_json(except: :descendant_ids), params[:deleted_ids])
      end

      namespace :shared do
        desc "Update shared collection"
        params do
          requires :id, type: Integer
          requires :permission_level, type: Integer
          requires :sample_detail_level, type: Integer
          requires :reaction_detail_level, type: Integer
          requires :wellplate_detail_level, type: Integer
        end
        put ':id' do
          Collection.find(params[:id]).update({
            permission_level: params[:permission_level],
            sample_detail_level: params[:sample_detail_level],
            reaction_detail_level: params[:reaction_detail_level],
            wellplate_detail_level: params[:wellplate_detail_level]
          })
        end

        desc "Create shared collections"
        params do
          requires :elements_filter, type: Hash do
            optional :sample, type: Hash do
              optional :all, type: Boolean
              optional :included_ids, type: Array
              optional :excluded_ids, type: Array
            end

            optional :reaction, type: Hash do
              optional :all, type: Boolean
              optional :included_ids, type: Array
              optional :excluded_ids, type: Array
            end

            optional :wellplate, type: Hash do
              optional :all, type: Boolean
              optional :included_ids, type: Array
              optional :excluded_ids, type: Array
            end
          end
          requires :collection_attributes, type: Hash do
            requires :permission_level, type: Integer
            requires :sample_detail_level, type: Integer
            requires :reaction_detail_level, type: Integer
            requires :wellplate_detail_level, type: Integer
          end
          requires :user_ids, type: Array
        end

        before do
          # TODO extract getElementIds to separate class? FilterParams e.g.?
          usecase = Usecases::Sharing::ShareWithUsers.new(params)
          sample_ids = usecase.getElementIds(params[:elements_filter], Sample)
          reaction_ids = usecase.getElementIds(params[:elements_filter], Reaction)
          wellplate_ids = usecase.getElementIds(params[:elements_filter], Wellplate)

          share_samples = ElementsPolicy.new(current_user, Sample.where(id: sample_ids)).share?
          share_reactions = ElementsPolicy.new(current_user, Reaction.where(id: reaction_ids)).share?
          share_wellplates = ElementsPolicy.new(current_user, Wellplate.where(id: wellplate_ids)).share?

          sharing_allowed = share_samples && share_reactions && share_wellplates

          error!('401 Unauthorized', 401) unless sharing_allowed
        end

        post do
          # TODO better way to do this?
          params[:collection_attributes][:shared_by_id] = current_user.id
          Usecases::Sharing::ShareWithUsers.new(params).execute!
        end
      end

      # TODO add authorization/authentication, e.g. is current_user allowed
      # to fetch this samples?
      desc "Return serialized samples for given collection id"
      params do
        requires :id, type: Integer, desc: "Collection id"
      end

      route_param :id do
        get :samples do
          Collection.find(params[:id]).samples
        end
      end

    end
  end
end
