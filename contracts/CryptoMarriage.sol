// SPDX-License-Identifier: MIT
pragma solidity ^0.8.7;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Burnable.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";

contract CryptoMarriage is ERC721, ERC721Burnable, AccessControl {
  uint256 marriageCounter;

  struct Marriage {
    uint256 referenceTime;
    uint256[] dayOffsets;
    string[] uris;
  }

  bytes32 public constant MINTER_ROLE = keccak256("MINTER_ROLE");
  Marriage[] public marriages;

  constructor() ERC721("CryptoMarriage", "CM") {
    _setupRole(DEFAULT_ADMIN_ROLE, msg.sender);
    _setupRole(MINTER_ROLE, msg.sender);
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
    uint256 tokenId = marriageCounter;
    unchecked {
      marriageCounter++;
    }
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
    marriages.push(marriage);
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
      _offsettedReferenceTime = _referenceTime + _dayOffsets[_index] * 86400; // 86400 is the number of seconds in a day
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
    override(ERC721, AccessControl)
    returns (bool)
  {
    return super.supportsInterface(interfaceId);
  }
}
