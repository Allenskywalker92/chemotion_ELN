require 'roo'
class Import::ImportSamples

  def self.import_samples_from_file(file_path, collection_id, current_user_id)
    ActiveRecord::Base.transaction do
      xlsx = Roo::Spreadsheet.open(file_path)

      #rows = xlsx.parse(name: "Name", description: "Description", smiles: "Smiles", value: 'Value')
      rows = xlsx.parse(name: /^\s*names?/i, description: /^\s*descriptions?/i, smiles: /^\s*smiles?/i, value: /^\s*values?/i)
      rows.shift
      rows.map do |row|
        molfile = Chemotion::PubchemService.molfile_from_smiles row[:smiles]
        byebug
        molecule = Molecule.find_or_create_by_molfile(molfile)

        if molecule.nil?
          raise "Import of Sample #{row[:name]}: Molecule is nil."
        end

        sample = Sample.create(name: row[:name], description: row[:description], molecule: molecule, imported_readout: row[:value], created_by: current_user_id)
        CollectionsSample.create(collection_id: collection_id, sample_id: sample.id)
      end
    end
  end

end
