const Role = require("../../models/roleModel");

// [GET] get role
// /api/v1/admin/roles
const getRoles = async (req, res) => {
  try {
    const roles = await Role.find({
      deleted: false,
    });
    res.status(200).json(roles);
  } catch (error) {
    res
      .status(400)
      .json({
        message: "Error getting permission group",
        error: error.message,
      });
  }
};

// [GET] get 1 role
// /api/v1/admin/role/:id
const getRole = async (req, res) => {
  try {
    const id = req.params.id;
    const role = await Role.find({
      _id: id,
      deleted: false,
    });
    if (!role) {
      res.status(400).json({ message: "Role not found!" });
    }
    res.status(200).json(role);
  } catch (error) {
    res
      .status(400)
      .json({ message: "Error getting permission", error: error.message });
  }
};

// [POST] Create Role
// /api/v1/admin/role
const createRole = async (req, res) => {
  try {
    const { title, description, permissions } = req.body;

    if (!title || !description) {
      return res.status(400).json({
        message: "Please enter complete information!",
      });
    }

    const existingRole = await Role.findOne({ title });
    if (existingRole) {
      return res.status(400).json({
        message: "This role already exists!",
      });
    }
    const newRole = new Role({
      title,
      description,
      permissions,
    });
    await newRole.save();

    return res.status(201).json({
      message: "Create successful roles!",
      role: newRole,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Error creating role!",
      error: error.message,
    });
  }
};
// [PATCH] /api/v1/roles/:id
const updateRole = async (req, res) => {
  try {
    const { id } = req.params;
    const data = req.body;

    const role = await Role.findOne({ _id: id, deleted: false });

    if (!role) {
      return res.status(404).json({ message: "Role not found!" });
    }

    await Role.updateOne({ _id: id }, data);

    return res.status(200).json({ message: "Role updated successfully!" });
  } catch (error) {
    return res.status(500).json({
      message: "Error updating role!",
      error: error.message,
    });
  }
};

// [PATCH] /api/v1/roles/permissions
const updatePermissions = async (req, res) => {
  try {
    const roles = req.body;

    for (const role of roles) {
      await Role.updateOne(
        { _id: role.id, deleted: false },
        { permissions: role.permissions },
      );
    }

    return res.status(200).json({
      message: "Permissions updated successfully!",
    });
  } catch (error) {
    return res.status(500).json({
      message: "Error updating permissions!",
      error: error.message,
    });
  }
};

module.exports = {
  getRoles,
  getRole,
  createRole,
  updateRole,
  updatePermissions,
};
