// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {SafeERC20} from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import {ReentrancyGuard} from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import {IArcNanoPool} from "./interfaces/IArcNanoPool.sol";

/**
 * @title ArcNanoBatchDeposit
 * @notice Helper utility contract to batch-mint multiple shielded notes into ArcNanoPool in 1 single transaction
 * @dev Enables users/agents to deposit $1.00, $5.00, $10.00+ and mint 100, 500, or 1,000 notes with a single wallet approval and signature.
 */
contract ArcNanoBatchDeposit is ReentrancyGuard {
    using SafeERC20 for IERC20;

    IArcNanoPool public immutable pool;
    IERC20 public immutable token;

    event BatchDepositSuccess(
        address indexed depositor,
        uint256 count,
        uint256 totalAmount,
        uint256 timestamp
    );

    constructor(IArcNanoPool _pool, IERC20 _token) {
        pool = _pool;
        token = _token;
    }

    /**
     * @notice Deposit an array of commitments in one single atomic transaction
     * @param commitments Array of cryptographic Poseidon commitments
     */
    function batchDeposit(bytes32[] calldata commitments) external nonReentrant {
        uint256 count = commitments.length;
        require(count > 0, "Empty batch");
        uint256 denomination = pool.denomination();
        uint256 totalAmount = denomination * count;

        // 1. Transfer aggregated USDC value from user to this batch helper in 1 transfer
        token.safeTransferFrom(msg.sender, address(this), totalAmount);

        // 2. Approve pool contract if current allowance is insufficient
        uint256 currentAllowance = token.allowance(address(this), address(pool));
        if (currentAllowance < totalAmount) {
            token.forceApprove(address(pool), type(uint256).max);
        }

        // 3. Deposit each commitment into the pool
        for (uint256 i = 0; i < count; i++) {
            pool.deposit(commitments[i]);
        }

        emit BatchDepositSuccess(msg.sender, count, totalAmount, block.timestamp);
    }
}
