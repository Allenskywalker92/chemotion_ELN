module Usecases
  module Sharing
    class ShareWithUsers
      def initialize(params)
        @params = params
      end

      # TODO some refactoring
      def getElementIds(elements_filter, elementClass)
        element = case elementClass.to_s
                  when 'Sample'
                    elements_filter.fetch(:sample, {})
                  when 'Reaction'
                    elements_filter.fetch(:reaction, {})
                  when 'Wellplate'
                    elements_filter.fetch(:wellplate, {})
                  when 'Screen'
                    elements_filter.fetch(:screen, {})
                  else
                    {}
                  end

        return [] if element.empty?

        if element.fetch(:all)
          excluded_ids = element.fetch(:excluded_ids, [])
          elementClass.where.not(id: excluded_ids).pluck(:id)
        else
          element.fetch(:included_ids, [])
        end
      end

      def execute!
        user_ids = @params.fetch(:user_ids, [])
        collection_attributes = @params.fetch(:collection_attributes, {})
        current_collection_id = @params.fetch(:current_collection_id, {})
        elements_filter = @params.fetch(:elements_filter, {})

        user_ids.each do |user_id|
          collection_attributes[:user_id] = user_id
          collection_attributes[:label] = new_collection_label(user_id)

          new_params = {
            collection_attributes: collection_attributes,
            sample_ids: getElementIds(elements_filter, Sample),
            reaction_ids: getElementIds(elements_filter, Reaction),
            wellplate_ids: getElementIds(elements_filter, Wellplate),
            screen_ids: getElementIds(elements_filter, Screen),
            current_collection_id: current_collection_id
          }

          Usecases::Sharing::ShareWithUser.new(new_params).execute!
        end
      end

      private

      def new_collection_label(user_id)
        "My project with #{User.find(user_id).name}"
      end
    end
  end
end
