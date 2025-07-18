`timescale 1ns/1ps

module testbench;

    // Inputs
    logic clk;
    logic rst;
    logic [31:0] signature_in;

    // Output
    logic match;

    // Instantiate the DUT (Device Under Test)
    verifier_top DUT (
        .clk(clk),
        .rst(rst),
        .signature_in(signature_in),
        .match(match)
    );

    // Clock Generation: 10ns period (100MHz)
    always #5 clk = ~clk;

    // Task to apply a signature input
    task apply_signature(input [31:0] sig);
        begin
            signature_in = sig;
            #10; // wait one clock cycle
        end
    endtask

    initial begin
        // Initialize
        clk = 0;
        rst = 1;
        signature_in = 32'd0;

        #15;  // Hold reset
        rst = 0;

        $display("------ TEST CASES START ------");

        // ✅ Test 1: Valid Signature (should match)
        // Region = 0x0A, Auth = 0x01, Expiry = 0x10, Signature ID = 0xF3
        apply_signature(32'h0A0110F3);
        #10;
        $display("Test 1 - Valid Match: Match = %0b", match);

        // ❌ Test 2: Wrong Region
        apply_signature(32'h0B0110F3);
        #10;
        $display("Test 2 - Wrong Region: Match = %0b", match);

        // ❌ Test 3: Wrong Auth Level
        apply_signature(32'h0A0210F3);
        #10;
        $display("Test 3 - Wrong Auth Level: Match = %0b", match);

        // ❌ Test 4: Wrong Signature ID
        apply_signature(32'h0A0110AA);
        #10;
        $display("Test 4 - Wrong Signature ID: Match = %0b", match);

        // ❌ Test 5: Expired (wrong expiry value)
        apply_signature(32'h0A0111F3);
        #10;
        $display("Test 5 - Expired Signature: Match = %0b", match);

        $display("------ TEST CASES END ------");
        #20;
        $finish;
    end

endmodule
