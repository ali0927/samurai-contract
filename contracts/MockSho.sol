// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "./MockERC20.sol";

contract MockSho is MockERC20 {
    constructor() ERC20("Shogun Token", "SS") {}

    function mint(address account, uint256 amount) public {
        _mint(account, amount);
    }

    function burn(address account, uint256 amount) public {
        _burn(account, amount);
    }
}
