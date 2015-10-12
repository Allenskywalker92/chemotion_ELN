class Screen < ActiveRecord::Base
  include ElementUIStateScopes
  include PgSearch
  include Collectable

  multisearchable against: [:name, :conditions, :requirements]

  # search related
  pg_search_scope :search_by_screen_name, against: :name
  pg_search_scope :search_by_conditions, against: :conditions
  pg_search_scope :search_by_requirements, against: :requirements
  pg_search_scope :search_by_substring, against: [:name, :conditions, :requirements],
                                        using: {trigram: {threshold:  0.0001}}

  scope :by_name, ->(query) { where('name ILIKE ?', "%#{query}%") }
  scope :by_conditions, ->(query) { where('conditions ILIKE ?', "%#{query}%") }
  scope :by_requirements, ->(query) { where('requirements ILIKE ?', "%#{query}%") }

  has_many :collections_screens
  has_many :collections, through: :collections_screens

  has_many :wellplates
end
