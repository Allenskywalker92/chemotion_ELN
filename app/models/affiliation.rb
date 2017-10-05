# frozen_string_literal: true

class Affiliation < ActiveRecord::Base
  attr_accessor :from_month, :to_month
  validates :organization, presence: true
  before_save :from_to

  has_many :user_affiliations
  has_many :users, through: :user_affiliations

  def output_array_full
    [group, department, organization, country]
  end

  def output_full
    output_array_full.map{|e| !e.blank? && e || nil}.compact.join(', ')
  end

  private

  def from_to
    %w(from to).each do |month|
      date = self.send(month + '_month')
      if date && date.match(/-?\d{1,4}-\d{2}/)
        self[month] = Date.strptime(date, '%Y-%m')
      end
    end
  end
end
