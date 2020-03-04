export const loader = (THREE, plainText) => {
  const voxels = [];

  const parsedData = JSON.parse(plainText);
  parsedData.voxels.forEach((voxel) => {
    const mesh = new THREE.Mesh(
      new THREE.BoxBufferGeometry(50, 50, 50),
      new THREE.MeshLambertMaterial({ color: new THREE.Color(...voxel.material.color) }),
    );
    mesh.position.fromArray(voxel.position);

    voxels.push(mesh);
  });

  return voxels;
};
