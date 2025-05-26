import 'package:starknet/starknet.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';

/// Singleton service for Starknet web3 integration
class StarknetService {
  static final StarknetService _instance = StarknetService._internal();
  factory StarknetService() => _instance;
  StarknetService._internal();

  final _storage = const FlutterSecureStorage();
  Wallet? _wallet;
  JsonRpcProvider? _provider;

  /// Initialize the provider (mainnet by default)
  void init({String nodeUri = 'https://starknet-mainnet.public.blastapi.io'}) {
    _provider = JsonRpcProvider(nodeUri: nodeUri);
  }

  /// Create or load a wallet (private key stored securely)
  Future<Wallet> getWallet() async {
    String? privKey = await _storage.read(key: 'starknet_private_key');
    if (privKey == null) {
      // Generate a new private key
      final newPrivKey = Felt.random().toHexString();
      await _storage.write(key: 'starknet_private_key', value: newPrivKey);
      privKey = newPrivKey;
    }
    _wallet = Wallet(privateKey: privKey, provider: _provider!);
    return _wallet!;
  }

  /// Get wallet address
  Future<String?> getAddress() async {
    final wallet = await getWallet();
    return wallet.address;
  }

  /// Call a contract (read-only)
  Future<List<Felt>> callContract({
    required String contractAddress,
    required List<dynamic> abi,
    required String functionName,
    List<Felt> calldata = const [],
  }) async {
    final contract = Contract(
      address: contractAddress,
      abi: abi,
      provider: _provider!,
    );
    return await contract.call(functionName, calldata);
  }

  /// Send a transaction (write)
  Future<String> sendTransaction({
    required String contractAddress,
    required List<dynamic> abi,
    required String functionName,
    List<Felt> calldata = const [],
  }) async {
    final wallet = await getWallet();
    final contract = Contract(
      address: contractAddress,
      abi: abi,
      provider: _provider!,
    );
    final txHash = await contract.invoke(
      functionName,
      calldata,
      signer: wallet,
    );
    return txHash;
  }

  /// Disconnect wallet (remove private key)
  Future<void> disconnect() async {
    await _storage.delete(key: 'starknet_private_key');
    _wallet = null;
  }
}

/// Usage Example:
///
/// final starknet = StarknetService();
/// starknet.init();
/// final address = await starknet.getAddress();
/// final result = await starknet.callContract(
///   contractAddress: '0x...',
///   abi: [...],
///   functionName: 'balanceOf',
///   calldata: [Felt.fromInt(123)],
/// );
