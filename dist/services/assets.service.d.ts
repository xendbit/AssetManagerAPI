import { NewAssetRequest } from '../models/request.objects/new-asset-request';
import { AssetTransferRequest } from '../models/request.objects/asset-transfer-request';
import { Asset } from '../models/asset.model';
export declare class AssetsService {
    private contractAddress;
    private abiPath;
    private abi;
    private AssetManagerContract;
    private web3;
    private userRepository;
    constructor();
    transferAsset(assetTransfer: AssetTransferRequest): Promise<Asset>;
    createAsset(asset: NewAssetRequest): Promise<Asset>;
    getAssets(): Promise<Asset[]>;
}
