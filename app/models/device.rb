class Device < ActiveRecord::Base
  has_many :devices_samples
  belongs_to :user
end
