"use server";

export const submitSignup = async (data: object) => {
  try {
    // 验证数据
    if (!data || typeof data !== "object") {
      throw new Error("无效的提交数据");
    }

    // 确保所有必需的字段都存在
    const requiredFields = [
      "firstName",
      "lastName",
      "email",
      "phone",
      "address",
      "city",
      "postalCode",
    ];
    for (const field of requiredFields) {
      if (!(field in data)) {
        throw new Error(`缺少必需的字段: ${field}`);
      }
    }

    // 模拟API调用
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // 返回成功响应
    return {
      success: true,
      message: "订单提交成功",
    };
  } catch (error) {
    console.error("提交订单时出错:", error);
    throw error;
  }
};
