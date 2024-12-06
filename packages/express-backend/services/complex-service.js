import complexModel from "../models/complex.js";

//find specific complex or return all complexes
function getComplexes(name) {
  let promise;
  if (name === undefined) {
    promise = complexModel.find();
  } else {
    promise = findComplexByName(name);
  }
  return promise;
}

//find complex by complexID
function findComplexById(id) {
  return complexModel.findById(id);
}

//find complex by name
function findComplexByName(name) {
  return complexModel.find({ name: name });
}

export default {
  getComplexes,
  findComplexById,
  findComplexByName
};
