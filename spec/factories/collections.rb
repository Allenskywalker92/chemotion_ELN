FactoryGirl.define do
  factory :collection do
    user_id 1
    sequence(:label) { |i| "Collection #{i}" }

    is_shared false
    permission_level 0
    sample_detail_level 0
    reaction_detail_level 0
    wellplate_detail_level 0
  end
end
