/**
 * Copyright (c) Haiku 2016-2018. All rights reserved.
 */

import Layout3D from '../Layout3D';
import mat4Decompose, {DecomposedMat4} from '../vendor/mat4-decompose';
import math3d from '../vendor/math3d';
import MathUtils from './MathUtils';

export default function composedTransformsToTimelineProperties(out, matrices) {
  // Note the array reversal - to combine matrices we go in the opposite of the transform sequence
  // I.e. if we transform A->B->C, the multiplication order should be CxBxA
  const decomposed = mat4Decompose(Layout3D.multiplyArrayOfMatrices(matrices.reverse()));

  if (decomposed === false) {
    return out;
  }

  const {translation, scale, quaternion} = decomposed as DecomposedMat4;
  if (scale.indexOf(0) !== -1) {
    // In any dimension and axis of rotation, a single scale factor of 0 vanishes to the horizon. We can pick an
    // arbitrary axis to scale to 0 and use this to describe the layout without loss of effect.
    return {
      'scale.x': 0,
    };
  }

  const rotation = math3d.getEulerAngles.apply(undefined, quaternion)
    .map((degrees) => Number(MathUtils.degreesToRadians(degrees).toFixed(2)));

  // The reason for the conditional test is we don't want to bother assigning the attribute if it's the default/fallback
  // (keeps the bytecode less noisy if we only include what is really an override)
  if (translation[0] !== 0) {
    out['translation.x'] = translation[0];
  }
  if (translation[1] !== 0) {
    out['translation.y'] = translation[1];
  }
  if (translation[2] !== 0) {
    out['translation.z'] = translation[2];
  }
  if (rotation[0] !== 0) {
    out['rotation.x'] = rotation[0];
  }
  if (rotation[1] !== 0) {
    out['rotation.y'] = rotation[1];
  }
  if (rotation[2] !== 0) {
    out['rotation.z'] = rotation[2];
  }
  if (scale[0] !== 1) {
    out['scale.x'] = scale[0];
  }
  if (scale[1] !== 1) {
    out['scale.y'] = scale[1];
  }
  if (scale[2] !== 1) {
    out['scale.z'] = scale[2];
  }

  return out;
}
