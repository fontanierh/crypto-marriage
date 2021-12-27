// SPDX-License-Identifier: MIT
pragma solidity ^0.8.7;

import "@openzeppelin/contracts-upgradeable/token/ERC721/ERC721Upgradeable.sol";
import "@openzeppelin/contracts-upgradeable/token/ERC721/extensions/ERC721BurnableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/access/AccessControlUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/utils/CountersUpgradeable.sol";

contract CryptoMarriage is
  Initializable,
  ERC721Upgradeable,
  ERC721BurnableUpgradeable,
  AccessControlUpgradeable
{
  using CountersUpgradeable for CountersUpgradeable.Counter;

  struct Marriage {
    uint256 referenceTime;
    uint256[] dayOffsets;
    string[] uris;
  }

  bytes32 public constant MINTER_ROLE = keccak256("MINTER_ROLE");
  mapping(uint256 => Marriage) public marriages;

  CountersUpgradeable.Counter private _tokenIdCounter;

  /// @custom:oz-upgrades-unsafe-allow constructor
  constructor() initializer {}

  function initialize() public initializer {
    __ERC721_init("CryptoMarriage", "CM");
    __ERC721Burnable_init();
    __AccessControl_init();

    _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
    _grantRole(MINTER_ROLE, msg.sender);
  }

  function createMarriage(
    address to,
    uint256 _referenceTime,
    string[] calldata _uris,
    uint256[] calldata _daysOffsets
  ) public {
    require(
      hasRole(MINTER_ROLE, msg.sender),
      "Only minters can create marriages"
    );
    require(
      _referenceTime < block.timestamp,
      "Reference time must be in the past"
    );
    uint256 tokenId = _tokenIdCounter.current();
    _tokenIdCounter.increment();
    _safeMint(to, tokenId);

    require(
      _uris.length == _daysOffsets.length + 1,
      "Number of uris must be equal to number of day offsets + 1"
    );

    require(
      _daysOffsets.length > 0,
      "Number of day offsets must be greater than 0"
    );

    if (_daysOffsets.length > 1) {
      for (uint256 index = 1; index < _daysOffsets.length; index++) {
        require(
          _daysOffsets[index] > _daysOffsets[index - 1],
          "Day offsets must be strictly increasing"
        );
      }
    }

    Marriage memory marriage = Marriage({
      referenceTime: _referenceTime,
      dayOffsets: _daysOffsets,
      uris: _uris
    });
    marriages[tokenId] = marriage;
  }

  function tokenURI(uint256 tokenId)
    public
    view
    virtual
    override
    returns (string memory)
  {
    require(_exists(tokenId), "URI query for nonexistent token");

    Marriage memory _marriage = marriages[tokenId];

    uint256[] memory _dayOffsets = _marriage.dayOffsets;
    uint256 _referenceTime = _marriage.referenceTime;
    uint256 _index;
    uint256 _offsettedReferenceTime;

    for (_index = 0; _index < _dayOffsets.length; _index++) {
      _offsettedReferenceTime = _referenceTime + _dayOffsets[_index] * 86400;
      if (block.timestamp < _offsettedReferenceTime) {
        break;
      }
    }

    return _marriage.uris[_index];
  }

  // The following functions are overrides required by Solidity.

  function supportsInterface(bytes4 interfaceId)
    public
    view
    override(ERC721Upgradeable, AccessControlUpgradeable)
    returns (bool)
  {
    return super.supportsInterface(interfaceId);
  }
}
