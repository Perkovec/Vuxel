export const exporter = (voxels) => {
  const data = {
    version: '1',
    voxels: [],
  };

  let minorVoxel;
  voxels.forEach((voxel) => {
    minorVoxel = {
      position: voxel.position.toArray(),
      material: {
        color: voxel.material.color.toArray(),
      },
    };
    data.voxels.push(minorVoxel);
  });

  return data;
};
