class AllElementSearch
  def initialize(term, user_id)
    @term = term
    @user_id = user_id
  end

  def search_by_substring
    Results.new(PgSearch.multisearch(@term), @user_id)
  end

  class Results
    attr_reader :samples, :results

    def initialize(results, user_id)
      @results = results
      @user_id = user_id
    end

    def first
      Results.new(@results.first, @user_id)
    end

    def empty?
      @results.empty?
    end

    def by_collection_id(id)
      if (@results.count > 0)
        types = @results.map(&:searchable_type).uniq
        first_type = types.first
        query = "(searchable_type = '#{first_type}' AND searchable_id IN (" \
                  "SELECT #{first_type}_id FROM collections_#{first_type}s "\
                  "WHERE collection_id = #{id}))"
        if (types.count > 1)
          types[1..-1].each { |type|
            query = query +
                    " OR (searchable_type = '#{type}' AND searchable_id IN (" \
                    "SELECT #{type}_id FROM collections_#{type}s "\
                    "WHERE collection_id = #{id}))"
          }
        end

        @results = @results.where(query)
      end

      Results.new(@results, @user_id)
    end

    def molecules
      filter_results_by_type('Molecule')
    end

    def samples
      filter_results_by_type('Sample')
    end

    def reactions
      filter_results_by_type('Reaction')
    end

    def wellplates
      filter_results_by_type('Wellplate')
    end

    def screens
      filter_results_by_type('Screen')
    end

    private

    def filter_results_by_type(type)
      @results.where(searchable_type: type).includes(:searchable)
    end
  end
end
