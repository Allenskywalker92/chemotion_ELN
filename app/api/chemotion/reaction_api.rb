module Chemotion
  class ReactionAPI < Grape::API
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
          Collection.belongs_to_or_shared_by(current_user.id).find(params[:collection_id]).reactions
        else
          Reaction.joins(:collections).where('collections.user_id = ?', current_user.id)
        end.order("created_at DESC")

        paginate(scope)
      end

      desc "Return serialized reaction by id"
      params do
        requires :id, type: Integer, desc: "Reaction id"
      end
      route_param :id do
        before do
          error!('401 Unauthorized', 401) unless ElementPolicy.new(@current_user, Reaction.find(params[:id])).read?
        end

        get do
          Reaction.find(params[:id])
        end
      end

    end
  end
end
