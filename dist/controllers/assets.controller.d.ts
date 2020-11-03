import { AssetTransferRequest } from '../models/request.objects/asset-transfer-request';
import { NewAssetRequest } from '../models/request.objects/new-asset-request';
import { AssetsService } from '../services/assets.service';
import { Asset } from 'src/models/asset.model';
export declare class AssetsController {
    private readonly assetsService;
    constructor(assetsService: AssetsService);
    getAllAssets(): Promise<Asset[]>;
    createNewAsset(asset: NewAssetRequest): Promise<Asset>;
    transferAssset(assetTranfer: AssetTransferRequest): Promise<Asset>;
}
