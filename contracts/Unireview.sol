// SPDX-License-Identifier: MIT
pragma solidity 0.8.5;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "hardhat/console.sol";

contract Unireview is ERC721, Ownable {
    using Counters for Counters.Counter;
    Counters.Counter private _tokenIdCounter;
    IERC20 public UnireviewToken;

    mapping(uint256 => Project) public projects;
    mapping(uint256 => Review[]) public reviews;
    mapping(uint256 => mapping(address => bool)) public reviewed;

    struct Project {
        uint256 projectId;
        string name;
        string symbol;
        string description;
        uint256 createdTime;
    }

    struct Review {
        address user;
        string review;
        uint256 timestamp;
    }

    event ProjectCreated(uint256 projectId, string projectName, string symbol, string projectDescription, uint256 createdTime);
    event ProjectReview(uint256 indexed projectId, address indexed user, uint256 timestamp);

    constructor(IERC20 _unireviewToken) ERC721("Unireview", "URV") {
        UnireviewToken = _unireviewToken;
    }

    function registerProject(string memory _projectName,  string memory _symbol, string memory _projectDescription) public onlyOwner {
        require(
            !isNull(_projectName) &&
            !isNull(_symbol) &&
            !isNull(_projectDescription),
            "Unireview: All fields are marked required"
        );
        _tokenIdCounter.increment();
        uint256 _id = _tokenIdCounter.current();

        projects[_id] = Project(
            _id, 
            _projectName, 
            _symbol, 
            _projectDescription,
            block.timestamp
        );

        _safeMint(address(this), _id);
        emit ProjectCreated(_id, _projectName, _symbol, _projectDescription, block.timestamp);
    }

    function review(uint256 _projectId, string memory _review) external {
        require(!isNull(projects[_projectId].name), "Unireview: projectId does not exist");
        require(
            !reviewed[_projectId][_msgSender()], 
            "Unireview: Project have already been reviewed"
        );
        require(!isNull(_review), "Unireview: review can not be empty");

        reviewed[_projectId][_msgSender()] = true;
        reviews[_projectId].push(
            Review(_msgSender(), _review, block.timestamp)
        );
        emit ProjectReview(_projectId, _msgSender(), block.timestamp);
    }

    function isNull(string memory _data) internal pure returns(bool) {
        return keccak256(abi.encodePacked(_data)) == keccak256(abi.encodePacked(""));
    }

    /**
     * Always returns `IERC721Receiver.onERC721Received.selector`.
     */
    function onERC721Received(address, address, uint256, bytes memory) public virtual returns (bytes4) {
        return this.onERC721Received.selector;
    }
}