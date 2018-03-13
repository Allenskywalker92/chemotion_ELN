import React from 'react';
import Formula from './Formula';

const sumFormula = (sf, stereo) => <Formula formula={sf} customText={stereo} />;

const sampleNameWithResidues = (polymer_type, sumFormulaCom, moleculeName) => {
  const polymerName = (polymer_type.charAt(0).toUpperCase()
    + polymer_type.slice(1)).replace('_', '-') + ' - ';

  return (
    <div>
      <p>
        {polymerName}
        {sumFormulaCom}
      </p>
      <p>{moleculeName}</p>
    </div>
  );
};

const SampleName = ({ sample }) => {
  const { sum_formular, iupac_name } = sample._molecule;
  const { contains_residues, polymer_type, molecule_name } = sample;
  const mnl = sample.molecule_name_label;
  const mnd = molecule_name && molecule_name.desc;
  const isSumForm = mnd && mnd.match(/sum_formula/);
  const sameMol = !molecule_name || molecule_name.mid == sample._molecule.id;
  const moleculeName = mnl && sameMol && !isSumForm && mnl ? mnl : iupac_name;

  let stereo = '';
  if (sample.stereo) {
    const stereoInfo = Object.keys(sample.stereo).reduce((acc, k) => {
      const val = sample.stereo[k];
      if (val === 'any' || !val) return acc;

      const linker = acc === '' ? '' : ', ';
      return `${acc}${linker}${k}: ${val}`;
    }, '');

    stereo = stereoInfo === '' ? '' : ` - ${stereoInfo}`;
  }
  const sumFormulaCom = sumFormula(sum_formular, stereo);

  if (contains_residues) {
    return sampleNameWithResidues(polymer_type, sumFormulaCom, moleculeName);
  }

  return (
    <div>
      <p>{sumFormulaCom}</p>
      <p>{moleculeName}</p>
    </div>
  );
};

export default SampleName;
