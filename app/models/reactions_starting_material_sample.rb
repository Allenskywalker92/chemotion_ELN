class ReactionsStartingMaterialSample < ActiveRecord::Base
  acts_as_paranoid
  belongs_to :reaction
  belongs_to :sample
end
