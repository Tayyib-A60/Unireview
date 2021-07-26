const { ethers } = require("hardhat");
const { expect, assert } = require("chai");
const { ZERO_ADDRESS } = require("@openzeppelin/test-helpers/src/constants");

const toBytes32 = (_data) => ethers.utils.formatBytes32String(_data);
const fromBytes32 = (_data) => ethers.utils.parseBytes32String(_data);

describe("Unireview", () => {
	const _name = "Bitcoin";
	const _symbol = "BTC";
	const _description =
		"The first cryptocurrent implemented on the Blockchain network";

	let deployer, user1, user2, user3;

	beforeEach(async () => {
		const unireviewToken = await ethers.getContractFactory("UnireviewToken");
		const unireview = await ethers.getContractFactory("Unireview");

		[deployer, user1, user2, user3] = await ethers.getSigners();

		this.token = await unireviewToken.deploy();
		this.unireview = await unireview.deploy(this.token.address);
	});

	describe("deployment", () => {
		it("should deployment Review contract properly", async () => {
			expect(this.unireview.address).not.equal(ZERO_ADDRESS);
			expect(this.unireview.address).not.equal(undefined);
			expect(this.unireview.address).not.equal(null);
			expect(this.unireview.address).not.equal("");
		});

		it("should set name properly", async () => {
			expect(await this.unireview.name()).to.equal("Unireview");
		});

		it("should set symbol properly", async () => {
			expect(await this.unireview.symbol()).to.equal("URV");
		});
	});

	describe("registerProject", () => {
		beforeEach(async () => {
			await this.unireview
				.connect(deployer)
				.registerProject(_name, _symbol, _description);
		});

		it("should register new projects properly", async () => {
			const { projectId, name, symbol, description, reviews } =
				await this.unireview.projects("1");

			expect(projectId.toNumber()).to.equal(1);
			expect(name).to.equal(_name);
			expect(symbol).to.equal(_symbol);
			expect(description).to.equal(_description);
		});

		it("should set owner of newly registered company to Unireview contract", async () => {
			expect(await this.unireview.ownerOf("1")).to.equal(
				this.unireview.address
			);
		});

		it("should reject if caller is not the deployer", async () => {
			try {
				await this.unireview
					.connect(user1)
					.registerProject(_name, _symbol, _description);
			} catch (error) {
				assert(error.toString().includes("Ownable: caller is not the owner"));
				return;
			}
			assert(false);
		});

		it("should reject if any field is empty", async () => {
			try {
				await this.unireview
					.connect(deployer)
					.registerProject("", _symbol, _description);
			} catch (error) {
				assert(
					error.toString().includes("Unireview: All fields are marked required")
				);
				return;
			}
			assert(false);
		});
	});

	describe("review", () => {
		const _review = "My first review";

		beforeEach(async () => {
			await this.unireview
				.connect(deployer)
				.registerProject(_name, _symbol, _description);

			await this.unireview.connect(user1).review("1", _review);
		});

		it("should add reviews properly", async () => {
			const _status = await this.unireview.reviewed("1", user1.address);
			const { user, review } = await this.unireview.reviews("1", "0");

			expect(_status).to.equal(true);
			expect(user).to.equal(user1.address);
			expect(review).to.equal(_review);
		});

		it("should reject duplicate review", async () => {
			try {
				await this.unireview.connect(user1).review("1", _review);
			} catch (error) {
				assert(
					error
						.toString()
						.includes("Unireview: Project have already been reviewed")
				);
				return;
			}
			assert(false);
		});

		it("should reject if project ID does not exist", async () => {
			try {
				await this.unireview.connect(user1).review("10", _review);
			} catch (error) {
				assert(
					error.toString().includes("Unireview: projectId does not exist")
				);
				return;
			}
			assert(false);
		});

		it("should reject if review data is empty", async () => {
			try {
				await this.unireview.connect(user2).review("1", "");
			} catch (error) {
				assert(error.toString().includes("Unireview: review can not be empty"));
				return;
			}
			assert(false);
		});
	});
});
