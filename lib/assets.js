const path = require('path');
const cdk = require('@aws-cdk/core');
const schema = require('@aws-cdk/cloud-assembly-schema');

class AssetStage extends cdk.Stage {
    constructor(scope, id, props) {
      super(scope, id, props);
    }
    
    get image() {
      const dest = this.#getDest();
      return `${dest.repositoryName}:${dest.imageTag}`;
    }

    /**
     * 
     * @returns {schema.DockerImageDestination}
     */
    #getDest(){
      const manifest = this.#getManifest();
      const image = Object.values(manifest.dockerImages)[0]
      return image.destinations[`${this.account}-${this.region}`];
    }
    
    /**
     * 
     * @returns {schema.AssetManifest}
     */
    #getManifest() {
      const asm = this.synth();
      let artifact = asm.artifacts.find(a => 
        a.manifest.type == schema.ArtifactType.ASSET_MANIFEST);
      const file = artifact.manifest.properties.file;
      return schema.Manifest.loadAssetManifest(path.join(asm.directory, file));
    }
  }

  module.exports = { AssetStage }