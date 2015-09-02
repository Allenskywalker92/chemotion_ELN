module Chemotion
  class ReactionAPI < Grape::API
    # TODO ensure user is authenticated

    include Grape::Kaminari

    resource :reactions do

      #todo: more general search api
      desc "Return serialized reactions"
      params do
        optional :collection_id, type: Integer, desc: "Collection id"
      end
      paginate per_page: 5, max_per_page: 25, offset: 0

      get do
        scope = if params[:collection_id]
          Collection.where("user_id = ? OR shared_by_id = ?", current_user.id, current_user.id).find(params[:collection_id]).reactions
        else
          Reaction.all
        end.order("created_at DESC")

        paginate(scope)
      end

      desc "Return serialized sample by id"
      params do
        requires :id, type: Integer, desc: "Reaction id"
      end
      route_param :id do
        get do
          Reaction.find(params[:id])
        end
      end

    end
  end
end
