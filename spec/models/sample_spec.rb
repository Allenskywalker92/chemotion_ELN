require 'rails_helper'

RSpec.describe Sample, type: :model do

  describe 'creation' do
    let(:sample) { create(:sample) }
    it 'is possible to create a valid sample' do
      expect(sample.valid?).to be(true)
    end
  end



  context 'with molecule' do

    let(:sample) { build(:sample) }
    let(:molecule) {create(:molecule)}

    it 'should belong to a sample' do
      sample.molecule = molecule
      sample.save

      persisted_sample = Sample.last
      expect(persisted_sample.molecule).to be === (molecule)
    end
  end

  context 'updating molfile' do
    let(:sample) { build(:sample, molfile: molfile) }

    let(:molfile) {
      <<-MOLFILE
H2O Water 7732185
##CCCBDB 8251509:58
Geometry Optimized at HF/STO-3G
  3  2  0  0  0  0  0  0  0  0    V2000
    0.0000    0.0000    0.1271 O  0000000000000000000
    0.0000    0.7580   -0.5085 H  0000000000000000000
    0.0000   -0.7580   -0.5085 H  0000000000000000000
  1  2  1  0     0  0
  1  3  1  0     0  0
M  END
MOLFILE
    }

    it 'should create a molecule' do
      sample.save
      molecule = sample.molecule
      expect(molecule).to be_present
    end

    it 'should retrive molecule information' do
      sample.save
      molecule = sample.molecule
      expect(molecule.attributes).to include(
             "inchikey" => "XLYOFNOQVPJJNP-UHFFFAOYSA-N",
          "inchistring" => "InChI=1S/H2O/h1H2",
              "density" => nil,
     "molecular_weight" => 18.01528,
              "molfile" => molfile,
        "melting_point" => nil,
        "boiling_point" => nil,
         "sum_formular" => "H2O",
                "names" => ["water", "oxidane"],
           "iupac_name" => "oxidane",
    "molecule_svg_file" => "XLYOFNOQVPJJNP-UHFFFAOYSA-N.svg"
      )
    end

    it 'should create the molecule svg file' do
      expect(File).to receive(:new).with('public/images/molecules/XLYOFNOQVPJJNP-UHFFFAOYSA-N.svg','w+').and_call_original
      sample.save
    end

  end

end
